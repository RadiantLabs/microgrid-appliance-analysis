import _ from 'lodash'
import { types, flow, getSnapshot, getParent, isAlive } from 'mobx-state-tree'
import * as tf from '@tensorflow/tfjs'
import localforage from 'localforage'
import Papa from 'papaparse'
import prettyBytes from 'pretty-bytes'
import { getIsoTimestamp, removeFileExtension } from '../utils/helpers'
import {
  csvOptions,
  analyzeHomerFile,
  fetchSampleFile,
  fetchSnapshotGridFile,
} from '../utils/importFileHelpers'
import {
  computeBaselineLoss,
  convertTableToTrainingData,
  calculateTestSetLoss,
  calculateFinalLoss,
  arraysToTensors,
  calcPredictedVsActualData,
  calcReferenceLine,
  formatTrainingTimeDisplay,
  neuralNet1Hidden,
} from '../utils/tensorflowHelpers'

//
// -----------------------------------------------------------------------------
// Homer + Battery Kinetic Model Store
// -----------------------------------------------------------------------------
export const GridStore = types
  .model({
    fileInfo: types.frozen(),
    fileData: types.frozen(),
    label: types.string,
    description: types.string,
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
    pvType: types.string,
    powerType: types.enumeration('powerType', ['AC', 'DC', '']),
    batteryType: types.string,
    generatorType: types.string,

    wholesaleElectricityCost: types.maybeNull(types.number),
    retailElectricityPrice: types.maybeNull(types.number),
    unmetLoadCostPerKwh: types.maybeNull(types.number),

    batteryMinSoC: types.maybeNull(types.number),
    batteryMaxSoC: types.maybeNull(types.number),
    batteryMinEnergyContent: types.maybeNull(types.number),
    batteryMaxEnergyContent: types.maybeNull(types.number),

    // Battery trained model
    batteryMaxEpochCount: types.number,
    batteryModelStopLoss: types.number,
    batteryBatchSize: types.number,
    batteryLearningRate: types.number,
    batteryTargetColumn: types.string,
    batteryTrainingColumns: types.array(types.string),
    batteryModel: types.maybeNull(types.frozen()),
    batteryModelName: types.string,
    batteryTrainingState: types.enumeration('trainingState', ['None', 'Training', 'Trained']),
    batteryFinalTrainSetLoss: types.maybeNull(types.number),
    batteryValidationSetLoss: types.maybeNull(types.number),
    batteryTestSetLoss: types.maybeNull(types.number),
    batteryTrainLogs: types.frozen(),
    batteryPlottablePredictionVsActualData: types.frozen(),

    // Below are volatile properties. Switch them after I get it working
    batteryCurrentEpoch: types.maybeNull(types.number),
    batteryTrainingTime: types.maybeNull(types.number),

    // Temporary UI state variables. Maybe move into volatile state?
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    isBatteryModeling: types.boolean,
    gridSaved: types.boolean,
    batteryModelSaved: types.boolean,
    modelInputValues: types.frozen(),
    modelInputErrors: types.frozen(),
  })
  .volatile(self => ({}))
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },

    // onModelInputChange depends on inputs being validated by the InputField
    // before saving to the model. InputField uses fieldDefinitions for validation
    onModelInputChange(fieldKey, value, error) {
      const newModelInputValues = _.clone(self.modelInputValues)
      const newModelInputErrors = _.clone(self.modelInputErrors)
      newModelInputValues[fieldKey] = value
      newModelInputErrors[fieldKey] = error
      self.modelInputValues = newModelInputValues
      self.modelInputErrors = newModelInputErrors
    },

    onModelInputBlur(fieldKey, value, error) {
      if (!Boolean(error)) {
        self[fieldKey] = value === 0 ? 0 : value || ''
      } else {
        console.log('Value not saved to store')
      }
    },

    // These files come in through the file upload button
    handleGridFileUpload(rawFile) {
      self.fileIsSelected = true
      self.isAnalyzingFile = true
      const { name, size, type: mimeType } = rawFile
      const timeStamp = getIsoTimestamp()
      const fileInfo = {
        id: `${name}_${timeStamp}`,
        timeStamp,
        fileType: 'homer',
        name,
        size,
        isSample: false,
        mimeType,
      }
      Papa.parse(rawFile, {
        ...csvOptions,
        complete: parsedFile => {
          const gridAttrs = analyzeHomerFile(parsedFile, fileInfo, mimeType)
          self.runInAction(() => {
            self.label = removeFileExtension(name)
            self.updateModel({ ...gridAttrs })
          })
        },
        error: error => {
          console.log('error: ', error)
        },
      })
    },

    // These files come in from either samples or previously uploaded user files
    loadFile: flow(function* loadFile(fileInfo) {
      self.isAnalyzingFile = true
      const analyzedFile = self.fileInfo.isSample
        ? yield fetchSampleFile(fileInfo, window.location)
        : yield fetchSnapshotGridFile(fileInfo)
      self.updateModel(analyzedFile)
      self.isAnalyzingFile = false
    }),

    updateModel(analyzedFile) {
      self.runInAction(() => {
        self.fileInfo = analyzedFile.fileInfo
        self.fileData = analyzedFile.fileData
        self.fileErrors = analyzedFile.fileErrors
        self.fileWarnings = analyzedFile.fileWarnings
        self.powerType = analyzedFile.powerType
        self.pvType = analyzedFile.pvType
        self.batteryType = analyzedFile.batteryType
        self.generatorType = analyzedFile.generatorType
        self.batteryMinSoC = analyzedFile.batteryMinSoC
        self.batteryMaxSoC = analyzedFile.batteryMaxSoC
        self.batteryMinEnergyContent = analyzedFile.batteryMinEnergyContent
        self.batteryMaxEnergyContent = analyzedFile.batteryMaxEnergyContent
        self.isAnalyzingFile = false
      })
    },

    trainBatteryModel: flow(function* batteryModelRun({
      batteryFeatureCount,
      batteryTensors,
      batteryLearningRate,
      batteryBatchSize,
      batteryMaxEpochCount,
    }) {
      if (!self.batteryReadyToTrain) {
        return null
      }
      let model = neuralNet1Hidden(batteryFeatureCount, batteryLearningRate)
      self.batteryModelName = 'Neural Network Regression with 1 Hidden Layer'
      self.batteryTrainingState = 'Training'
      const t0 = performance.now()
      yield model.fit(batteryTensors.trainFeatures, batteryTensors.trainTarget, {
        batchSize: batteryBatchSize,
        epochs: batteryMaxEpochCount,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            // Prevent trying to write to the grid if it's no longer part of the state tree
            // It may be destroyed if cancelling a file upload
            if (!isAlive(self)) {
              return null
            }
            const t1 = performance.now()
            self.runInAction(() => {
              self.batteryCurrentEpoch = epoch
              self.batteryTrainLogs = self.batteryTrainLogs.concat({ epoch, ...logs })
              self.batteryTrainingTime = t1 - t0
              if (logs.val_loss < self.batteryModelStopLoss) {
                model.stopTraining = true
              }
            })
          },
          onTrainEnd: () => {
            if (!isAlive(self)) {
              return null
            }
            const testSetLoss = calculateTestSetLoss(model, batteryTensors, batteryBatchSize)
            const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
              self.batteryTrainLogs
            )
            const t1 = performance.now()
            self.runInAction(() => {
              self.batteryModel = model
              self.batteryTestSetLoss = testSetLoss
              self.batteryFinalTrainSetLoss = finalTrainSetLoss
              self.batteryValidationSetLoss = finalValidationSetLoss
              self.batteryTrainingTime = t1 - t0
              self.batteryTrainingState = 'Trained'
            })
          },
        },
      })
    }),

    retrainBatteryModel() {
      _.forEach(initialBatteryState, (val, key) => (self[key] = val))
      self.trainBatteryModel({
        batteryFeatureCount: self.batteryFeatureCount,
        batteryTensors: self.batteryTensors,
        batteryLearningRate: self.batteryLearningRate,
        batteryBatchSize: self.batteryBatchSize,
        batteryMaxEpochCount: self.batteryMaxEpochCount,
      })
    },

    setBatteryPlottablePredictionVsActualData() {
      self.batteryPlottablePredictionVsActualData = calcPredictedVsActualData(
        self.batteryTrainingData,
        self.batteryModel
      )
    },

    saveGridSnapshot: flow(function* saveGridSnapshot() {
      function handleSave(artifacts) {
        localforage.setItem('microgridAppliances.batteryModel', artifacts).then(() => {
          self.runInAction(() => {
            self.batteryModelSaved = true
          })
        })
      }
      const batteryModelSaveReport = yield self.batteryModel.save(tf.io.withSaveHandler(handleSave))
      console.log('batteryModelSaveReport: ', batteryModelSaveReport)
      const gridSnapshot = _.omit(getSnapshot(self), ['batteryModel'])
      localforage.setItem('microgridAppliances.stagedGrid', gridSnapshot).then(() => {
        self.runInAction(() => {
          self.gridSaved = true
        })
      })
    }),
  }))
  .views(self => ({
    get showAnalyzedResults() {
      if (getParent(self).viewedGridIsStaged) {
        return self.fileIsSelected && !self.isAnalyzingFile
      }
      return true
    },
    get batteryFeatureCount() {
      return _.size(self.batteryTrainingColumns)
    },
    get batteryTrainingTimeDisplay() {
      return formatTrainingTimeDisplay(self.batteryTrainingTime, self.batteryMaxEpochCount)
    },
    get batteryTrainingData() {
      return convertTableToTrainingData(
        self.fileData,
        self.batteryTargetColumn,
        self.batteryTrainingColumns
      )
    },
    get batteryReadyToTrain() {
      return _.every([
        _.isEmpty(self.batteryModel),
        _.isEmpty(self.fileErrors),
        _.isFinite(self.batteryFeatureCount),
        !_.isEmpty(self.batteryTensors),
        self.batteryLearningRate,
        self.batteryBatchSize,
        self.batteryMaxEpochCount,
        !_.isEmpty(self.batteryTrainingColumns),
      ])
    },
    get batteryIsTrained() {
      return self.batteryTrainingState === 'Trained'
    },
    get batteryIsTraining() {
      return self.batteryTrainingState === 'Training'
    },
    get batteryBaselineLoss() {
      return computeBaselineLoss(self.tensors)
    },
    get batteryTensors() {
      return arraysToTensors(self.batteryTrainingData)
    },
    get batteryPlottableReferenceLine() {
      return calcReferenceLine(self.batteryTrainingData)
    },
    get isActiveGrid() {
      const activeGridId = _.get(getParent(self).activeGrid, 'fileInfo.id')
      return activeGridId ? self.fileInfo.id === activeGridId : false
    },
    get prettyFileSize() {
      return prettyBytes(self.fileInfo.size)
    },
  }))

//
// -----------------------------------------------------------------------------
// Initial Grid State
// -----------------------------------------------------------------------------
const initialBatteryState = {
  batteryMaxEpochCount: 40,
  batteryCurrentEpoch: 0,
  batteryModelStopLoss: 0.05,
  batteryBatchSize: 40,
  batteryLearningRate: 0.01,
  batteryTargetColumn: 'Original Battery Energy Content',
  batteryTrainingColumns: [
    'originalElectricalProductionLoadDiff',
    'prevOriginalBatteryEnergyContent',
  ],
  batteryTrainingTime: null,
  batteryModel: null,
  batteryModelName: '',
  batteryTrainingState: 'None',
  batteryTrainLogs: [],
  batteryFinalTrainSetLoss: null,
  batteryValidationSetLoss: null,
  batteryTestSetLoss: null,
  batteryPlottablePredictionVsActualData: [],
}

export const initialGridState = {
  fileInfo: {},
  fileData: [],
  label: '',
  description: '',
  fileErrors: [],
  fileWarnings: [],
  pvType: '',
  powerType: '',
  batteryType: '',
  generatorType: '',
  wholesaleElectricityCost: null,
  retailElectricityPrice: null,
  unmetLoadCostPerKwh: null,
  batteryMinSoC: null,
  batteryMaxSoC: null,
  batteryMinEnergyContent: null,
  batteryMaxEnergyContent: null,
  batteryModelSaved: false,
  fileIsSelected: false,
  isAnalyzingFile: false,
  isBatteryModeling: false,
  gridSaved: false,
  modelInputValues: {},
  modelInputErrors: {},
  ...initialBatteryState,
}

// saveModelSync(model) {
//   function handleSave(artifacts) {
//     console.log('artifacts: ', artifacts)
//     // ... do something with the artifacts ...
//     // const { modelTopology, weightSpecs, weightData } = artifacts
//     // TODO:
//     // 1. Save to localforage
//     // 2. Load model from localforage
//     // const model = await tf.loadModel(tf.io.fromMemory(modelTopology, weightSpecs, weightData))
//   }
//   const saveResult = model.save(tf.io.withSaveHandler(handleSave))
//   // handleSave()
//   return null
// },

// saveModel: flow(function* saveModel(model) {
//   // const savedModelLocalStorage = yield model.save(
//   //   'localstorage://microgridAppliances_test_saved_model'
//   // )
//   // const savedModelDownload = yield model.save(
//   //   'downloads://microgridAppliances_test_saved_model'
//   // )
// }),
