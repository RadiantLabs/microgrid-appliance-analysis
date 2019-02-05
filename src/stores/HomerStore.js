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
  .actions(self => ({
    // TODO: Try to convert this to a computed property. Mobx doesn't allow
    // async computed properties but mobx-state-tree might.
    // trainBatteryModel(calculatedColumns) {
    //   const combinedTable = getParent(self.combinedTable)
    //   if (!_.isEmpty(combinedTable)) {
    //     self.batteryTrainingData = convertTableToTrainingData(
    //       combinedTable,
    //       self.batteryTargetColumn,
    //       self.batteryTrainingColumns
    //     )
    //   }
    // },

    // retrainBatteryModel() {
    //   self.batteryCurrentEpoch = 0
    //   self.batteryModel = null
    //   self.batteryTrainLogs = []
    //   self.batteryTrainingTime = null // TODO: make types nullable above
    //   self.batteryFinalTrainSetLoss = null
    //   self.batteryValidationSetLoss = null
    //   self.batteryTestSetLoss = null
    //   self.batteryTrainingState = 'None'
    //   self.trainBatteryModel(getParent(self.calculatedColumns))
    // }),

    batteryRegressor: flow(function* batteryRegressor(
      numFeatures,
      tensors,
      learningRate,
      batchSize,
      epochCount,
      trainingColumns
    ) {
      self.batteryModelName = 'Neural Network Regression with 1 Hidden Layer'
      yield self.batteryModelRun({
        model: multiLayerPerceptronRegressionModel1Hidden(numFeatures),
        tensors: tensors,
        learningRate,
        batchSize,
        epochCount,
        trainingColumns,
      })
    }),

    batteryModelRun: flow(function* batteryModelRun({
      model,
      tensors,
      learningRate,
      batchSize,
      epochCount,
      trainingColumns,
    }) {
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
            self.batteryCurrentEpoch = epoch
            self.batteryTrainLogs.push({ epoch, ...logs })
            self.batteryTrainingTime = t1 - t0
            if (logs.val_loss < self.batteryModelStopLoss) {
              model.stopTraining = true
            }
          },
          onTrainEnd: () => {
            const testSetLoss = calculateTestSetLoss(model, tensors, batchSize)
            const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
              self.batteryTrainLogs
            )
            const t1 = performance.now()
            self.batteryModel = model
            self.batteryTestSetLoss = testSetLoss
            self.batteryFinalTrainSetLoss = finalTrainSetLoss
            self.batteryValidationSetLoss = finalValidationSetLoss
            self.batteryTrainingTime = t1 - t0
            self.batteryTrainingState = 'Trained'
          },
        },
      })
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
    get batteryTensors() {
      if (_.isEmpty(self.batteryTrainingData)) {
        return null
      }
      const { trainFeatures, trainTarget, testFeatures, testTarget } = self.batteryTrainingData
      return arraysToTensors(trainFeatures, trainTarget, testFeatures, testTarget)
    },
    get batteryBaselineLoss() {
      return self.bostonDataIsLoading ? null : computeBaselineLoss(self.tensors)
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
