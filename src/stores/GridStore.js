import _ from 'lodash'
import { types, flow, getParent } from 'mobx-state-tree'
import * as tf from '@tensorflow/tfjs'
import Papa from 'papaparse'
import prettyBytes from 'pretty-bytes'
import { csvOptions, verifyHomerFile } from 'utils/helpers'
import {
  computeBaselineLoss,
  convertTableToTrainingData,
  calculateTestSetLoss,
  calculateFinalLoss,
  arraysToTensors,
  calculatePlottablePredictedVsActualData,
  multiLayerPerceptronRegressionModel1Hidden,
} from 'utils/tensorflowHelpers'
window.tf = tf

const initialBatteryState = {
  batteryEpochCount: 3,
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
export const initialHomerState = {
  // I will be adding more HOMER-specific fields soon
  ...initialBatteryState,
}

/**
 * Homer + Battery Kinetic Model Store
 */
export const GridStore = types
  .model({
    fileName: types.string,
    fileSize: types.number,
    fileData: types.frozen(),
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
    pvType: types.string,
    powerType: types.enumeration('powerType', ['AC', 'DC']),
    batteryType: types.string,

    batteryEpochCount: types.number, // Change to batteryMaxEpochCount
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

    // Below are volatile properties. Switch them after I get it working
    batteryCurrentEpoch: types.maybeNull(types.number),
    batteryTrainingTime: types.maybeNull(types.number),
    batteryTrainLogs: types.frozen(),
  })
  .volatile(self => ({
    // stagedHomerFile: types.frozen(),
  }))
  .actions(self => ({
    // For doing updates from within anonymous functions inside the flow generators
    // https://github.com/mobxjs/mobx-state-tree/issues/915#issuecomment-404461322
    runInAction(fn) {
      return fn()
    },
  }))
  .actions(self => ({
    onGridFileUpload(rawFile) {
      console.log('parsing rawFile: ', rawFile)
      Papa.parse(rawFile, {
        ...csvOptions,
        complete: parsedFile => {
          console.log('completed parseFile: ', parsedFile)
          const { fileName, fileSize, fileData, fileErrors, fileWarnings } = verifyHomerFile(
            rawFile,
            parsedFile
          )
          // TODO: save in volatile store as 'staged' file
          // Once approved, change as active homer file and save to local storage
          self.runInAction(() => {
            self.stagedHomerFile = parsedFile
          })
        },
        error: error => {
          console.log('error: ', error)
        },
      })
    },

    trainBatteryModel: flow(function* batteryModelRun({
      numFeatures,
      tensors,
      learningRate,
      batchSize,
      epochCount,
      trainingColumns,
    }) {
      let model = multiLayerPerceptronRegressionModel1Hidden(numFeatures)
      self.batteryModelName = 'Neural Network Regression with 1 Hidden Layer'
      if (_.isEmpty(tensors)) {
        return null
      }
      model.compile({
        optimizer: tf.train.sgd(learningRate),
        loss: 'meanSquaredError',
      })
      self.batteryTrainingState = 'Training'
      const t0 = performance.now()
      yield model.fit(tensors.trainFeatures, tensors.trainTarget, {
        batchSize: batchSize,
        epochs: epochCount,
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
            const testSetLoss = calculateTestSetLoss(model, tensors, batchSize)
            const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
              self.batteryTrainLogs
            )
            const t1 = performance.now()
            // self.saveModel(model)
            // self.saveModelSync(model)
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
        numFeatures: self.batteryNumFeatures,
        tensors: self.batteryTensors,
        learningRate: self.batteryLearningRate,
        batchSize: self.batteryBatchSize,
        epochCount: self.batteryEpochCount,
        trainingColumns: self.batteryTrainingColumns,
      })
    },

    saveModelSync(model) {
      function handleSave(artifacts) {
        console.log('artifacts: ', artifacts)
        // ... do something with the artifacts ...
        // const { modelTopology, weightSpecs, weightData } = artifacts
        // TODO:
        // 1. Save to localforage
        // 2. Load model from localforage
        // const model = await tf.loadModel(tf.io.fromMemory(modelTopology, weightSpecs, weightData))
      }
      // const saveResult = model.save(tf.io.withSaveHandler(handleSave))
      handleSave()
      return null
    },

    saveModel: flow(function* saveModel(model) {
      // const savedModelLocalStorage = yield model.save(
      //   'localstorage://microgridAppliances_test_saved_model'
      // )
      // const savedModelDownload = yield model.save(
      //   'downloads://microgridAppliances_test_saved_model'
      // )
      // console.log('savedModelDownload: ', savedModelDownload)
      // const savedModelQuestion = yield model.save()
      // console.log('savedModelQuestion: ', savedModelQuestion)
      // debugger
    }),
  }))
  .views(self => ({
    get batteryNumFeatures() {
      return _.size(self.batteryTrainingColumns)
    },
    get batteryTrainingTimeDisplay() {
      return `${_.round(self.batteryTrainingTime / 1000)} sec (~${_.round(
        self.batteryTrainingTime / 1000 / self.batteryEpochCount
      )} sec/epoch)`
    },
    get batteryTrainingData() {
      return convertTableToTrainingData(
        getParent(self).combinedTable,
        self.batteryTargetColumn,
        self.batteryTrainingColumns
      )
    },
    get batteryBaselineLoss() {
      return _.isEmpty(self.tensors) ? null : computeBaselineLoss(self.tensors)
    },
    get batteryTensors() {
      if (_.isEmpty(self.batteryTrainingData)) {
        return null
      }
      const { trainFeatures, trainTarget, testFeatures, testTarget } = self.batteryTrainingData
      return arraysToTensors(trainFeatures, trainTarget, testFeatures, testTarget)
    },
    get batteryPlottablePredictionVsActualData() {
      if (_.isEmpty(self.batteryModel)) {
        return []
      }
      return calculatePlottablePredictedVsActualData(
        self.batteryTrainingData,
        self.batteryModel,
        self.batteryInputTensorShape
      )
    },
    get batteryPlottableReferenceLine() {
      if (_.isEmpty(self.batteryTrainingData)) {
        return []
      }
      const { trainTarget, testTarget } = self.batteryTrainingData
      const allTargets = _.map(trainTarget.concat(testTarget), target => target[0])
      const range = _.range(_.round(_.min(allTargets)), _.round(_.max(allTargets)))
      return _.map(range, val => {
        return { actual: val, predicted: val }
      })
    },
  }))
