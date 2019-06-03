import _ from 'lodash'
import { asFraction } from '../utils/helpers'
import { trainMlrBatteryModel } from './trainMlrBatteryModel'
import { trainPolyBatteryModel } from './trainPolyBatteryModel'
// import { trainLossCoeffBatteryModel } from './trainLossCoeffBatteryModel'

// We are comparing prediction models, so we should not take into account the
// new appliances. Therefore, these models need to use:
// 1. prevBatteryEnergyContent - but from that specific calculation (hence the reduce function)
// 2. originalElectricalProductionLoadDiff (which does not include the new appliance)
export function calcBatteryDebugData(fileData, min, max) {
  if (_.isEmpty(fileData) || !min || !max) {
    return []
  }
  console.log('running calcBatteryDebugData')

  const { trainedMlrModel, trainedMlrModelPos, trainedMlrModelNeg } = trainMlrBatteryModel(fileData)
  const { trainedPolyModelPos, trainedPolyModelNeg } = trainPolyBatteryModel(fileData)
  // const {
  //   lossCoeffPosData,
  //   lossCoeffNegData,
  //   trainedLossCoeffPos,
  //   trainedLossCoeffNeg,
  // } = trainLossCoeffBatteryModel(fileData)

  return _.reduce(
    fileData,
    (result, row, id) => {
      const originalBec = row['originalBatteryEnergyContent']
      const startBec = id === 0 ? row['originalBatteryEnergyContent'] : NaN
      const chargeDiff = row['originalElectricalProductionLoadDiff']
      const prevChargeDiff = id === 0 ? chargeDiff : result[id - 1]['chargeDiff']

      // _______________________________________________________________________
      // Naive Model with no clamping or efficiency loss
      // _______________________________________________________________________
      const naive = naivePrediction({ result, chargeDiff, prevChargeDiff, startBec, id })

      // _______________________________________________________________________
      // Naive Model with clamping (Current Model)
      // _______________________________________________________________________
      const naiveClamped = naiveClampedPrediction({
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // Loss Coefficient Function Clamped
      // _______________________________________________________________________
      const lossCoeffClamped = lossCoeffPrediction({
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // MLR
      // _______________________________________________________________________
      const mlr = mlrPrediction({
        trainedMlrModel,
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // MLR Positive and Negative
      // _______________________________________________________________________
      const mlrPosNeg = mlrPosNegPrediction({
        trainedMlrModelPos,
        trainedMlrModelNeg,
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // Polynomial Regression
      // _______________________________________________________________________
      const poly = polyPrediction({
        trainedPolyModelPos,
        trainedPolyModelNeg,
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // Manual Polynomial Regression
      // _______________________________________________________________________
      const manualPoly = manualPolyPrediction({
        result,
        chargeDiff,
        prevChargeDiff,
        min,
        max,
        startBec,
        id,
      })

      // _______________________________________________________________________
      // Output results
      // _______________________________________________________________________
      const featureWtihTarget = {
        hour: id,
        originalBec: _.round(originalBec, 2),
        chargeDiff,
        naive: _.round(naive, 2),
        naiveClamped: _.round(naiveClamped, 2),
        lossCoeffClamped: _.round(lossCoeffClamped, 2),
        mlr: _.round(mlr, 2),
        mlrPosNeg: _.round(mlrPosNeg, 2),
        poly: _.round(poly, 2),
        manualPoly: _.round(manualPoly, 2),
      }
      result.push(featureWtihTarget)
      return result
    },
    []
  )
}

// _______________________________________________________________________
// Naive
// _______________________________________________________________________
function naivePrediction({ result, chargeDiff, prevChargeDiff, startBec, id }) {
  const prevBec = id === 0 ? startBec : result[id - 1]['naive']
  return prevBec + chargeDiff
}

// _______________________________________________________________________
// Naive Clamped
// _______________________________________________________________________
// This is currently battery model used
function naiveClampedPrediction({ result, chargeDiff, prevChargeDiff, min, max, startBec, id }) {
  const prevBec = id === 0 ? startBec : result[id - 1]['naiveClamped']
  const unclamped = prevBec + chargeDiff
  return _.clamp(unclamped, min, max)
}

// _______________________________________________________________________
// Loss Coefficient
// _______________________________________________________________________
function lossCoeffPrediction({ result, chargeDiff, prevChargeDiff, min, max, startBec, id }) {
  const prevBec = id === 0 ? startBec : result[id - 1]['lossCoeffClamped']
  const isPositive = prevChargeDiff > 0
  const coeff = isPositive
    ? calcLossCoeffPos(prevBec, prevChargeDiff, min, max)
    : calcLossCoeffNeg(prevBec, prevChargeDiff, min, max)
  const unclamped = prevBec + coeff * chargeDiff
  return _.clamp(unclamped, min, max)
}

export function calcLossCoeffPos(prevBec, prevChargeDiff, min, max) {
  const constantLoss = 0.8
  const becNaive = prevBec + prevChargeDiff
  const becAsFraction = asFraction(becNaive, min, max)
  if (becAsFraction <= 0.95) {
    return constantLoss
  }
  return 1 - Math.tanh(0.9 * becAsFraction)
}

export function calcLossCoeffNeg(prevBec, prevChargeDiff, min, max) {
  const constantLoss = 1.3
  const becNaive = prevBec + prevChargeDiff
  const becAsFraction = asFraction(becNaive, min, max)
  if (becAsFraction >= 0.38) {
    return constantLoss
  }
  return 1 + Math.tanh(1 - becAsFraction)
}

// _______________________________________________________________________
// MLR
// _______________________________________________________________________
function mlrPrediction({
  trainedMlrModel,
  result,
  chargeDiff,
  prevChargeDiff,
  min,
  max,
  startBec,
  id,
}) {
  const prevBec = id === 0 ? startBec : result[id - 1]['lossCoeffClamped']
  const feature = [prevBec, chargeDiff] // if using prevChargeDiff make sure to also train with it
  const [unclamped] = trainedMlrModel.predict(feature)
  return _.clamp(unclamped, min, max)
}

// _______________________________________________________________________
// MLR separate for positive and negative
// _______________________________________________________________________
function mlrPosNegPrediction({
  trainedMlrModelPos,
  trainedMlrModelNeg,
  result,
  chargeDiff,
  prevChargeDiff,
  min,
  max,
  startBec,
  id,
}) {
  const prevBec = id === 0 ? startBec : result[id - 1]['lossCoeffClamped']
  const feature = [prevBec, chargeDiff] // if using prevChargeDiff make sure to also train with it
  const [unclamped] =
    chargeDiff > 0 ? trainedMlrModelPos.predict(feature) : trainedMlrModelNeg.predict(feature)
  return _.clamp(unclamped, min, max)
}

// _______________________________________________________________________
// Polynomial Regression
// _______________________________________________________________________
function polyPrediction({
  trainedPolyModelPos,
  trainedPolyModelNeg,
  result,
  chargeDiff,
  prevChargeDiff,
  min,
  max,
  startBec,
  id,
}) {
  const prevBec = id === 0 ? startBec : result[id - 1]['poly']
  const yNaive = prevBec + chargeDiff
  const isPositive = chargeDiff > 0

  // Results of predict is a tuple, where the first element is the input value (x)
  // and the second value is the output value (y): y = ax^2 + bx + c
  const unclamped = isPositive
    ? trainedPolyModelPos.predict(yNaive)[1]
    : trainedPolyModelNeg.predict(yNaive)[1]
  return _.clamp(unclamped, min, max)
}

// _______________________________________________________________________
// Manual Polynomial Regression
// _______________________________________________________________________
// Given yNaive (x), this gives alpha
// yActual = alpha * yNaive
const manualPolyPosAlpha = x => 2.996e-5 * x ** 2 - 0.0043 * x + 0.9727
const manualPolyNegAlpha = x => -0.0001 * x ** 2 + 0.0164 * x + 0.4139
function manualPolyPrediction({ result, chargeDiff, prevChargeDiff, min, max, startBec, id }) {
  const prevBec = id === 0 ? startBec : result[id - 1]['manualPoly']
  const yNaive = prevBec + chargeDiff
  const isPositive = chargeDiff > 0

  const alpha = isPositive ? manualPolyPosAlpha(yNaive) : manualPolyNegAlpha(yNaive)
  const yActual = alpha * yNaive
  return _.clamp(yActual, min, max)
}

// Rescale between -1 and 1
// https://stats.stackexchange.com/a/178629
// function rescale(x, xmin, xmax) {
//   return (2 * (x - xmin)) / (xmax - xmin) - 1
// }

// Generalized rescale between any range
// domain: domain values in the app, 26.4, 56.6....
// range: what we are mapping the domain values to: -1, 1
function rescale(val, domainMin, domainMax, rangeMin = 0, rangeMax = 1) {
  const scale = rangeMax - rangeMin
  return scale * ((val - domainMin) / (domainMax - domainMin)) + domainMin
}
