import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'
window.tf = tf

// Return an array of training features for every target value
// Split them into a training and testing dataset
export function convertTableToTrainingData(
  table,
  targetColumn,
  trainingColumns,
  trainingSplitPercent = 0.65
) {
  const shuffledTable = _.shuffle(table)

  // Array of target variables. The index of each target should line up with the
  // index of each feature set in the next dataset (so shuffle them first).
  // We can have multiple target variables. If only one, return an array with 1 value.
  // I could potentially target SoC and Energy Content...
  const targets = _.map(shuffledTable, row => [row[targetColumn]])

  // Order of the training features don't matter, as long as they are consistent
  // with training targets
  const features = _.map(shuffledTable, row => _.map(trainingColumns, col => row[col]))

  debugTensorMean(features, 'nosplit')
  const splitCount = _.round(targets.length * trainingSplitPercent)
  const [trainFeatures, testFeatures] = _.chunk(features, splitCount)
  const [trainTarget, testTarget] = _.chunk(targets, splitCount)
  debugTensorMean(trainFeatures, 'split')
  return { trainFeatures, testFeatures, trainTarget, testTarget }
}

function debugTensorMean(features, label) {
  console.log('__________ mean and st dev debugging ______________')
  // These are mean and stdev of the training features from the 12-50 Oversize 20.csv HOMER files
  const feature0ActualMean = 0.77472 // 0: electricalProductionLoadDiff
  const feature0ActualStdev = 2.93018
  const feature1ActualMean = 72.79839 // 1: prevBatterySOC
  const feature1ActualStdev = 15.58218

  const { dataMean, dataStd } = determineMeanAndStddev(tf.tensor2d(features))
  const feature0MeanCompare = _.round(100 * (1 - feature0ActualMean / dataMean.dataSync()[0]), 2)
  const feature1MeanCompare = _.round(100 * (1 - feature1ActualMean / dataMean.dataSync()[1]), 2)
  console.log(`dataMean feature 0 ${label}: `, dataMean.dataSync()[0], `${feature0MeanCompare}%`)
  console.log(`dataMean feature 1 ${label}: `, dataMean.dataSync()[1], `${feature1MeanCompare}%`)

  const pldStDevCompare = _.round(100 * (1 - feature0ActualStdev / dataStd.dataSync()[0]), 2)
  const pbsocStDevCompare = _.round(100 * (1 - feature1ActualStdev / dataStd.dataSync()[1]), 2)
  console.log(`dataStd feature 0 ${label}: `, dataStd.dataSync()[0], `${pldStDevCompare}%`)
  console.log(`dataStd feature 1 ${label}: `, dataStd.dataSync()[1], `${pbsocStDevCompare}%`)
}

/**
 * Convert loaded data into normalized tensors
 * @param {*} data
 */
export function arraysToTensors(
  trainFeaturesArray,
  trainTargetArray,
  testFeaturesArray,
  testTargetArray
) {
  const rawTrainFeatures = tf.tensor2d(trainFeaturesArray)
  const trainTarget = tf.tensor2d(trainTargetArray)
  const rawTestFeatures = tf.tensor2d(testFeaturesArray)
  const testTarget = tf.tensor2d(testTargetArray)

  // Normalize mean and standard deviation of data.
  const { dataMean, dataStd } = determineMeanAndStddev(rawTrainFeatures)
  return {
    trainFeatures: normalizeTensor(rawTrainFeatures, dataMean, dataStd),
    trainTarget,
    testFeatures: normalizeTensor(rawTestFeatures, dataMean, dataStd),
    testTarget,
  }
}

/**
 * Given expected mean and standard deviation, normalizes a dataset by
 * subtracting the mean and dividing by the standard deviation.
 *
 * @param {Tensor2d} data: Data to normalize. Shape: [batch, numFeatures].
 * @param {Tensor1d} dataMean: Expected mean of the data. Shape [numFeatures].
 * @param {Tensor1d} dataStd: Expected std of the data. Shape [numFeatures]
 *
 * @returns {Tensor2d}: Tensor the same shape as data, but each column
 * normalized to have zero mean and unit standard deviation.
 */
export function normalizeTensor(data, dataMean, dataStd) {
  return data.sub(dataMean).div(dataStd)
}

export function computeBaselineLoss(tensors) {
  const averageTargetValue = tf.mean(tensors.trainTarget)
  const baseline = tf.mean(tf.pow(tf.sub(tensors.testTarget, averageTargetValue), 2))
  return _.round(baseline.dataSync()[0])
}

/**
 * Calculates the mean and standard deviation of each column of a data array.
 *
 * @param {Tensor2d} data Dataset from which to calculate the mean and
 *                        std of each column independently.
 *
 * @returns {Object} Contains the mean and standard deviation of each vector
 *                   column as 1d tensors.
 */
export function determineMeanAndStddev(data) {
  const dataMean = data.mean(0)
  const diffFromMean = data.sub(dataMean)
  const squaredDiffFromMean = diffFromMean.square()
  const variance = squaredDiffFromMean.mean(0)
  const dataStd = variance.sqrt()
  return { dataMean, dataStd }
}

/**
 * Builds and returns Linear Regression Model.
 *
 * @returns {tf.Sequential} The linear regression model.
 */
export function linearRegressionModel(numFeatures) {
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [numFeatures], units: 1 }))
  model.summary() // Logs out summary of layers and output shapes
  return model
}

/**
 * Builds and returns Multi Layer Perceptron Regression Model
 * with 1 hidden layers, each with 10 units activated by sigmoid.
 *
 * @returns {tf.Sequential} The multi layer perceptron regression model.
 */
export function multiLayerPerceptronRegressionModel1Hidden(numFeatures) {
  const model = tf.sequential()
  model.add(
    tf.layers.dense({
      inputShape: [numFeatures],
      units: 50,
      activation: 'sigmoid',
      kernelInitializer: 'leCunNormal',
    })
  )
  model.add(tf.layers.dense({ units: 1 }))
  model.summary()
  return model
}

/**
 * Builds and returns Multi Layer Perceptron Regression Model
 * with 2 hidden layers, each with 10 units activated by sigmoid.
 *
 * @returns {tf.Sequential} The multi layer perceptron regression mode  l.
 */
export function multiLayerPerceptronRegressionModel2Hidden(numFeatures) {
  const model = tf.sequential()
  model.add(
    tf.layers.dense({
      inputShape: [numFeatures],
      units: 50,
      activation: 'sigmoid',
      kernelInitializer: 'leCunNormal',
    })
  )
  model.add(
    tf.layers.dense({
      units: 50,
      activation: 'sigmoid',
      kernelInitializer: 'leCunNormal',
    })
  )
  model.add(tf.layers.dense({ units: 1 }))
  model.summary()
  return model
}

export function calculateTestSetLoss(model, tensors, batchSize) {
  const testSetLoss = model.evaluate(tensors.testFeatures, tensors.testTarget, {
    batchSize: batchSize,
  })
  return _.round(testSetLoss.dataSync()[0])
}

export function calculateFinalLoss(trainLogs) {
  const finalTrainSetLoss = trainLogs[trainLogs.length - 1].loss
  const finalValidationSetLoss = trainLogs[trainLogs.length - 1].val_loss
  return {
    finalTrainSetLoss: _.round(finalTrainSetLoss, 2),
    finalValidationSetLoss: _.round(finalValidationSetLoss, 2),
  }
}

/**
 * Describe the current linear weights for a human to read.
 *
 * @param {Array} kernel Array of floats.  One value per feature.
 * @returns {List} List of objects, each with a string feature name, and value
 *     feature weight.
 */
export function describeKernelElements(kernel, featureDescriptions) {
  const kernelSize = featureDescriptions.length
  tf.util.assert(
    kernel.length === kernelSize,
    `kernel must match featureDescriptions, got ${kernelSize}`
  )
  return _.map(kernel, (kernalValue, index) => {
    return {
      description: featureDescriptions[index],
      value: _.round(kernalValue, 2),
    }
  })
}

/**
 * Convert training and predicted values into plottable values for the
 * Actual vs Predicted chart
 */
export function calculatePlottablePredictedVsActualData(trainingData, model, inputTensorShape) {
  const { trainFeatures, trainTarget } = trainingData
  const rawTrainFeatures = tf.tensor2d(trainFeatures)
  const { dataMean, dataStd } = determineMeanAndStddev(rawTrainFeatures)
  const normalized_features = normalizeTensor(rawTrainFeatures, dataMean, dataStd)
  const normalized_predictions = model.predict(normalized_features).dataSync()
  return _.map(trainTarget, (target, targetIndex) => {
    return { actual: target[0], predicted: normalized_predictions[targetIndex] }
  })
}
