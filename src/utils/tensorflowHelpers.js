import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'

// Return an array of training features for every target value
// Split them into a training and testing dataset
// TODO:
// * make sure target and training have same length
// * make sure split count is greater than 50% or else we will have more than 2 chunks
export function convertTableToTensors(
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
  const features = _.map(shuffledTable, row => _.map(trainingColumns, col => row[col]))


  // TODO: deploy latest (comment out stuff that will break) so I can compare
  // table values with training & targets
  // Enable toggle-able columns that are stored in localstorage
  const splitCount = _.round(targets.length * 0.65)
  const [trainFeatures, testFeatures] = _.chunk(features, splitCount)
  const [trainTarget, testTarget] = _.chunk(targets, splitCount)

  // Convert to normalized tensors
  return arraysToTensors(trainFeatures, trainTarget, testFeatures, testTarget)
}

/**
 * Convert loaded data into tensors and creates normalized versions of the features.
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

/**
 * Shuffles data and target (maintaining alignment) using Fisher-Yates algorithm
 * Needs tests
 * Pass in array of arrays
 */
export function shuffle(dataOrig, targetOrig) {
  let data = _.cloneDeep(dataOrig)
  let target = _.cloneDeep(targetOrig)
  let counter = data.length
  let temp = 0
  let index = 0
  while (counter > 0) {
    index = (Math.random() * counter) | 0
    counter--
    // data:
    temp = data[counter]
    data[counter] = data[index]
    data[index] = temp
    // target:
    temp = target[counter]
    target[counter] = target[index]
    target[index] = temp
  }
  return [data, target]
}
