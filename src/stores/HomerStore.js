import _ from 'lodash'
import { types, flow, getParent } from 'mobx-state-tree'
import * as tf from '@tensorflow/tfjs'
import {
  computeBaselineLoss,
  convertTableToTrainingData,
  calculateTestSetLoss,
  calculateFinalLoss,
  arraysToTensors,
  calculatePlottablePredictedVsActualData,
  multiLayerPerceptronRegressionModel1Hidden,
} from 'utils/tensorflowHelpers'

/**
 * Homer + Battery Kinetic Model Store
 */
export const HomerStore = types
  .model({
    batteryEpochCount: types.number, // Change to batteryMaxEpochCount
    batteryModelStopLoss: types.number,
    batteryBatchSize: types.number,
    batteryLearningRate: types.number,
    batteryTargetColumn: types.string,
    batteryTrainingColumns: types.array(types.string),
    // batteryTrainingData: types.frozen(),
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
  // .volatile(self => ({}))
  // For doing updates from within anonymous functions inside the flow generators
  // https://github.com/mobxjs/mobx-state-tree/issues/915#issuecomment-404461322
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },
  }))
  .actions(self => ({
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
      self.batteryCurrentEpoch = 0
      self.batteryModel = null
      self.batteryTrainLogs = []
      self.batteryTrainingTime = null
      self.batteryFinalTrainSetLoss = null
      self.batteryValidationSetLoss = null
      self.batteryTestSetLoss = null
      self.batteryTrainingState = 'None'
      self.trainBatteryModel(getParent(self).calculatedColumns)
    },
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
