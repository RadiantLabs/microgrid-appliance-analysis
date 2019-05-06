import _ from 'lodash'
import { trainMlrBatteryModel } from './trainMlrBatteryModel'
import { trainPolyBatteryModel } from './trainPolyBatteryModel'

// We are comparing prediction models, so we should not take into account the
// new appliances. Therefore, these models need to use:
// 1. prevBatteryEnergyContent - but from that specific calculation (hence the reduce function)
// 2. originalElectricalProductionLoadDiff (which does not include the new appliance)
export function calcBatteryDebugData(fileData, batteryMin, batteryMax) {
  if (_.isEmpty(fileData) || !batteryMin || !batteryMax) {
    return []
  }
  console.log('running calcBatteryDebugData')

  const { trainedMlrModel, trainedMlrModelPos, trainedMlrModelNeg } = trainMlrBatteryModel(fileData)
  const { trainedPolyModelPos, trainedPolyModelNeg } = trainPolyBatteryModel(fileData)

  return _.reduce(
    fileData,
    (result, row, rowIndex) => {
      const originalElectricalProductionLoadDiff = row['originalElectricalProductionLoadDiff']
      const originalBatteryEnergyContent = row['originalBatteryEnergyContent']
      const originalPrevBatteryEnergyContent =
        rowIndex === 0
          ? originalBatteryEnergyContent
          : result[rowIndex - 1]['originalBatteryEnergyContent']

      // _______________________________________________________________________
      // Naive Model with no clamping or efficiency loss
      // _______________________________________________________________________
      const naivePrevBatteryEnergyContent =
        rowIndex === 0 ? originalBatteryEnergyContent : result[rowIndex - 1]['naive']
      const naive = naivePrediction(
        naivePrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff
      )
      // const naiveOriginalDiff = naive - originalBatteryEnergyContent
      // const naiveOriginalPct = (naiveOriginalDiff / originalBatteryEnergyContent) * 100

      // _______________________________________________________________________
      // Naive Model with clamping (Current Model)
      // _______________________________________________________________________
      const naiveClampedPrevBatteryEnergyContent =
        rowIndex === 0 ? originalBatteryEnergyContent : result[rowIndex - 1]['naiveClamped']

      // const naiveClampedPrevElProdLoadDiff =
      //   rowIndex === 0 ? 0 : result[rowIndex - 1]['originalElectricalProductionLoadDiff']

      // TODO: naive uses originalBatteryEnergyContent, so at the bottom it's always
      // off by one hour (so naive never gets as low as original). Does it makes sense
      // to even use the original? Maybe..., since the first hour uses the original and
      // subsequent hours use the prediction.
      // BUT: why is it off by 1 hour?

      const naiveClamped = naiveClampedPrediction(
        naiveClampedPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax
      )
      // const naiveClampedOriginalDiff = naiveClamped - originalBatteryEnergyContent
      // const naiveClampedOriginalPct = (naiveClampedOriginalDiff / originalBatteryEnergyContent) * 100

      // originalVsNaive({
      //   originalBatteryEnergyContent,
      //   originalElectricalProductionLoadDiff,
      //   originalPrevBatteryEnergyContent,
      //   naiveClamped,
      //   batteryMin,
      //   batteryMax,
      //   rowIndex,
      // })

      // _______________________________________________________________________
      // MLR
      // _______________________________________________________________________
      const mlrPrevBatteryEnergyContent =
        rowIndex === 0 ? originalBatteryEnergyContent : result[rowIndex - 1]['mlr']

      const mlr = mlrPrediction(
        trainedMlrModel,
        mlrPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax
      )

      // _______________________________________________________________________
      // MLR Positive and Negative
      // _______________________________________________________________________
      const mlrPosNegPrevBatteryEnergyContent =
        rowIndex === 0 ? originalBatteryEnergyContent : result[rowIndex - 1]['mlrPosNeg']

      const mlrPosNeg = mlrPosNegPrediction(
        trainedMlrModelPos,
        trainedMlrModelNeg,
        mlrPosNegPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax
      )

      // _______________________________________________________________________
      // Polynomial Regression
      // _______________________________________________________________________
      const polyPrevBatteryEnergyContent =
        rowIndex === 0 ? originalBatteryEnergyContent : result[rowIndex - 1]['poly']

      const poly = polyPrediction({
        trainedPolyModelPos,
        trainedPolyModelNeg,
        polyPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax,
        rowIndex,
      })

      // _______________________________________________________________________
      // Output results
      // _______________________________________________________________________
      const featureWtihTarget = {
        hour: rowIndex,
        originalBatteryEnergyContent: _.round(originalBatteryEnergyContent, 2),

        naive: _.round(naive, 2),
        // naiveOriginalDiff: _.round(naiveOriginalDiff, 2),
        // naiveOriginalPct: _.round(naiveOriginalPct, 2),

        naiveClamped: _.round(naiveClamped, 2),
        // naiveClampedOriginalDiff: _.round(naiveClampedOriginalDiff, 2),
        // naiveClampedOriginalPct: _.round(naiveClampedOriginalPct, 2),

        mlr: _.round(mlr, 2),
        mlrPosNeg: _.round(mlrPosNeg, 2),

        poly: _.round(poly, 2),
      }
      result.push(featureWtihTarget)
      return result
    },
    []
  )
}

// _______________________________________________________________________
// MLR
// _______________________________________________________________________
function mlrPrediction(
  trainedMlrModel,
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMin,
  batteryMax
) {
  const feature = [prevBatteryEnergyContent, electricalProductionLoadDiff]
  // const feature = [prevBatteryEnergyContent + electricalProductionLoadDiff]
  const [unclamped] = trainedMlrModel.predict(feature)
  return _.clamp(unclamped, batteryMin, batteryMax)
}

// _______________________________________________________________________
// MLR separate for positive and negative
// _______________________________________________________________________
function mlrPosNegPrediction(
  trainedMlrModelPos,
  trainedMlrModelNeg,
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMin,
  batteryMax
) {
  const feature = [prevBatteryEnergyContent, electricalProductionLoadDiff]
  const [unclamped] =
    electricalProductionLoadDiff > 0
      ? trainedMlrModelPos.predict(feature)
      : trainedMlrModelNeg.predict(feature)
  return _.clamp(unclamped, batteryMin, batteryMax)
}

// _______________________________________________________________________
// Polynomial Regression
// _______________________________________________________________________
function polyPrediction({
  trainedPolyModelPos,
  trainedPolyModelNeg,
  polyPrevBatteryEnergyContent,
  originalElectricalProductionLoadDiff,
  batteryMin,
  batteryMax,
  rowIndex,
}) {
  const isPos = originalElectricalProductionLoadDiff > 0
  const yNaive = polyPrevBatteryEnergyContent + originalElectricalProductionLoadDiff

  // Results of predict is a tuple, where the first element is the input value (x)
  // and the second value is the output value (y): y = ax^2 + bx + c
  const unclamped = isPos
    ? trainedPolyModelPos.predict(yNaive)[1]
    : trainedPolyModelNeg.predict(yNaive)[1]
  return _.clamp(unclamped, batteryMin, batteryMax)
}

// _______________________________________________________________________
// Naive
// _______________________________________________________________________
function naivePrediction(prevBatteryEnergyContent, electricalProductionLoadDiff) {
  return prevBatteryEnergyContent + electricalProductionLoadDiff
}

// _______________________________________________________________________
// Naive Clamped
// _______________________________________________________________________
// This is currently battery model used
function naiveClampedPrediction(
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMin,
  batteryMax
) {
  // TODO: Should not apply round trip losses if value gets clamped
  // const roundTripLosses = 0.01
  const unclamped = prevBatteryEnergyContent + electricalProductionLoadDiff
  // (prevBatteryEnergyContent + electricalProductionLoadDiff) * (1 - roundTripLosses)
  // prevBatteryEnergyContent + electricalProductionLoadDiff * 1.2
  // manualTweak(prevBatteryEnergyContent, electricalProductionLoadDiff)
  return _.clamp(unclamped, batteryMin, batteryMax)
}

function originalVsNaive({
  originalBatteryEnergyContent,
  originalElectricalProductionLoadDiff,
  originalPrevBatteryEnergyContent,
  naiveClamped,
  batteryMin,
  batteryMax,
  rowIndex,
}) {
  const alpha = originalBatteryEnergyContent / naiveClamped
  const correctedNaiveClamped = alpha * naiveClamped
  const originalNaiveCorrectedDiff = correctedNaiveClamped - originalBatteryEnergyContent
  if (rowIndex < 50) {
    console.table({
      originalBatteryEnergyContent: _.round(originalBatteryEnergyContent, 2),
      naiveClamped: _.round(naiveClamped, 2),
      _: null,
      alpha: alpha,
      correctedNaiveClamped: _.round(correctedNaiveClamped, 2),
      originalNaiveCorrectedDiff: originalNaiveCorrectedDiff,
      __: null,
      originalElectricalProductionLoadDiff: _.round(originalElectricalProductionLoadDiff, 2),
      originalPrevBatteryEnergyContent: _.round(originalPrevBatteryEnergyContent, 2),
      batteryMin: _.round(batteryMin, 2),
      batteryMax: _.round(batteryMax, 2),
      rowIndex,
    })
  }
}

// function manualTweak(prevBatteryEnergyContent, electricalProductionLoadDiff) {
//   const isPos = electricalProductionLoadDiff > 0
//   return isPos
//     ? prevBatteryEnergyContent + electricalProductionLoadDiff * 1.2
//     : prevBatteryEnergyContent + electricalProductionLoadDiff
// }

// Rescale between -1 and 1
// https://stats.stackexchange.com/a/178629
// function rescale(x, xmin, xmax) {
//   return (2 * (x - xmin)) / (xmax - xmin) - 1
// }

// Generalized rescale between any range
// domain: domain values in the app, 26.4, 56.6....
// range: what we are mapping the domain values to: -1, 1
// function rescale(val, domainMin, domainMax, rangeMin = -1, rangeMax = 1) {
//   const scale = rangeMax - rangeMin
//   const num = val - domainMin
//   const den = domainMax - domainMin
//   return scale * (num / den) - domainMin
// }
