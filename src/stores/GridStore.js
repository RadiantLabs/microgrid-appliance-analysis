import _ from 'lodash'
import { types, flow, getSnapshot } from 'mobx-state-tree'
import * as tf from '@tensorflow/tfjs'
import localforage from 'localforage'
import Papa from 'papaparse'
import { csvOptions, analyzeHomerFile } from 'utils/importFileHelpers'
import { fetchFile } from 'utils/importFileHelpers'
import {
  computeBaselineLoss,
  convertTableToTrainingData,
  calculateTestSetLoss,
  calculateFinalLoss,
  arraysToTensors,
  calculatePlottablePredictedVsActualData,
  calculatePlottableReferenceLine,
  formatTrainingTimeDisplay,
  multiLayerPerceptronRegressionModel1Hidden,
} from 'utils/tensorflowHelpers'

//
// -----------------------------------------------------------------------------
// Initial Grid State
// -----------------------------------------------------------------------------
const initialBatteryState = {
  batteryMaxEpochCount: 3,
  batteryCurrentEpoch: 0,
  batteryModelStopLoss: 0.1,
  batteryBatchSize: 40,
  batteryLearningRate: 0.01,
  batteryTargetColumn: 'Battery State of Charge',
  batteryTrainingColumns: ['electricalProductionLoadDiff', 'prevBatterySOC'],
  batteryTrainingTime: null,
  batteryModel: null,
  batteryModelName: '',
  batteryTrainingState: 'None',
  batteryTrainLogs: [],
  batteryFinalTrainSetLoss: null,
  batteryValidationSetLoss: null,
  batteryTestSetLoss: null,
}

export const initialGridState = {
  gridName: '',
  fileIsSelected: false,
  isAnalyzingFile: false,
  isBatteryModeling: false,
  gridSaved: false,
  batteryModelSaved: false,
  fileName: '',
  fileSize: 0,
  fileData: [],
  fileDescription: '',
  fileErrors: [],
  fileWarnings: [],
  pvType: '',
  powerType: '',
  batteryType: '',
  generatorType: '',
  batteryMinSoC: null,
  batteryMaxSoC: null,
  batteryMinEnergyContent: null,
  batteryMaxEnergyContent: null,
  ...initialBatteryState,
}

//
// -----------------------------------------------------------------------------
// Homer + Battery Kinetic Model Store
// -----------------------------------------------------------------------------
export const GridStore = types
  .model({
    // There are multiple grid stores. gridName identifies them to different views
    gridName: types.enumeration('gridName', ['activeGrid', 'stagedGrid', '']),

    // Temporary UI state variables. May be moved into volatile state
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    isBatteryModeling: types.boolean,
    gridSaved: types.boolean,
    batteryModelSaved: types.boolean,

    fileName: types.string,
    fileSize: types.number,
    fileData: types.frozen(),
    fileDescription: types.string,
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
    pvType: types.string,
    powerType: types.enumeration('powerType', ['AC', 'DC', '']),
    batteryType: types.string,
    generatorType: types.string,

    batteryMinSoC: types.maybeNull(types.number),
    batteryMaxSoC: types.maybeNull(types.number),
    batteryMinEnergyContent: types.maybeNull(types.number),
    batteryMaxEnergyContent: types.maybeNull(types.number),

    // Battery trained model
    batteryMaxEpochCount: types.number, // Change to batteryMaxEpochCount
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

    // Below are volatile properties. Switch them after I get it working
    batteryCurrentEpoch: types.maybeNull(types.number),
    batteryTrainingTime: types.maybeNull(types.number),
  })
  .volatile(self => ({
    // stagedHomerFile: types.frozen(),
  }))
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },
    // These files come in through the file upload button
    handleGridFileSelect(rawFile) {
      self.fileIsSelected = true
      self.isAnalyzingFile = true
      console.log('parsing rawFile: ', rawFile)
      const { name: fileName, size: fileSize, type: fileMimeType } = rawFile
      Papa.parse(rawFile, {
        ...csvOptions,
        complete: parsedFile => {
          const homerAttrs = analyzeHomerFile({
            parsedFile,
            fileName,
            fileSize,
            fileType: 'homer', // TODO: make this dynamic once we import appliance files
            fileMimeType,
            isSamplefile: false,
          })
          self.updateGrid(homerAttrs)
        },
        error: error => {
          console.log('error: ', error)
        },
      })
    },

    // These files come in from either samples or previously uploaded user files
    loadGridFile: flow(function* loadGridFile(gridInfo) {
      self.isAnalyzingFile = true
      const parsedFile = yield fetchFile(gridInfo, window.location)
      const { fileName, fileSize, fileType, isSamplefile } = gridInfo
      const homerAttrs = analyzeHomerFile({
        parsedFile,
        fileName,
        fileSize,
        fileType,
        isSamplefile,
      })
      self.updateGrid(homerAttrs)
      self.isAnalyzingFile = false
      return true
    }),

    updateGrid(homerAttrs) {
      self.runInAction(() => {
        self.fileData = homerAttrs.fileData
        self.fileName = homerAttrs.fileName
        self.fileSize = homerAttrs.fileSize
        self.fileErrors = homerAttrs.fileErrors
        self.fileWarnings = homerAttrs.fileWarnings
        self.powerType = homerAttrs.powerType
        self.pvType = homerAttrs.pvType
        self.batteryType = homerAttrs.batteryType
        self.generatorType = homerAttrs.generatorType
        self.batteryMinSoC = homerAttrs.batteryMinSoC
        self.batteryMaxSoC = homerAttrs.batteryMaxSoC
        self.batteryMinEnergyContent = homerAttrs.batteryMinEnergyContent
        self.batteryMaxEnergyContent = homerAttrs.batteryMaxEnergyContent
        self.isAnalyzingFile = false
      })
    },

    handleNameChange(event, data) {
      self.fileName = data.value
    },

    handleDescriptionChange(event, data) {
      self.fileDescription = data.value
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
      if (self.batteryModel) {
        return null
      }
      let model = multiLayerPerceptronRegressionModel1Hidden(batteryFeatureCount)
      self.batteryModelName = 'Neural Network Regression with 1 Hidden Layer'
      model.compile({
        optimizer: tf.train.sgd(batteryLearningRate),
        loss: 'meanSquaredError',
      })
      self.batteryTrainingState = 'Training'
      const t0 = performance.now()
      yield model.fit(batteryTensors.trainFeatures, batteryTensors.trainTarget, {
        batchSize: batteryBatchSize,
        epochs: batteryMaxEpochCount,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
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

    handleCancelUpload() {
      console.log('TODO: handleCancelUpload')
    },
    handleFileSave() {
      self.saveGridSnapshot()
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
      return self.fileIsSelected && !self.isAnalyzingFile
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
    get batteryPlottablePredictionVsActualData() {
      return calculatePlottablePredictedVsActualData(
        self.batteryTrainingData,
        self.batteryModel,
        self.batteryInputTensorShape
      )
    },
    get batteryPlottableReferenceLine() {
      return calculatePlottableReferenceLine(self.batteryTrainingData)
    },
  }))

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
