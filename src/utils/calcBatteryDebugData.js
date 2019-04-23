import _ from 'lodash'
import { trainMlrBatteryModel } from './trainMlrBatteryModel'

// We are comparing prediction models, so we should not take into account the
// new appliances. Therefore, these models need to use:
// 1. prevBatteryEnergyContent - but from that specific calculation (hence the reduce function)
// 2. originalElectricalProductionLoadDiff (which does not include the new appliance)
export function calcBatteryDebugData(fileData, batteryMin, batteryMax) {
  if (_.isEmpty(fileData) || !batteryMin || !batteryMax) {
    return []
  }
  const { trainedBatteryModel } = trainMlrBatteryModel(fileData)

  return _.reduce(
    fileData,
    (result, row, rowIndex, rows) => {
      const originalElectricalProductionLoadDiff = row['originalElectricalProductionLoadDiff']
      const homerOriginal = row['originalBatteryEnergyContent']

      // _______________________________________________________________________
      // Naive Model with no clamping or efficiency loss
      // _______________________________________________________________________
      // const naivePrevBatteryEnergyContent =
      //   rowIndex === 0 ? row['originalBatteryEnergyContent'] : result[rowIndex - 1]['naive']
      // const naive = naivePrediction(
      //   naivePrevBatteryEnergyContent,
      //   originalElectricalProductionLoadDiff
      // )
      // const naiveOriginalDiff = naive - homerOriginal
      // const naiveOriginalPct = (naiveOriginalDiff / homerOriginal) * 100

      // _______________________________________________________________________
      // Naive Model with clamping (Current Model)
      // _______________________________________________________________________
      const naiveClampedPrevBatteryEnergyContent =
        rowIndex === 0 ? row['originalBatteryEnergyContent'] : result[rowIndex - 1]['naiveClamped']
      const naiveClamped = naiveClampedPrediction(
        naiveClampedPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax
      )

      // _______________________________________________________________________
      // MLR
      // _______________________________________________________________________
      const mlrPrevBatteryEnergyContent =
        rowIndex === 0 ? row['originalBatteryEnergyContent'] : result[rowIndex - 1]['mlr']
      const mlr = mlrPrediction(
        trainedBatteryModel,
        mlrPrevBatteryEnergyContent,
        originalElectricalProductionLoadDiff,
        batteryMin,
        batteryMax
      )

      // _______________________________________________________________________
      // Output results
      // _______________________________________________________________________
      const featureWtihTarget = {
        hour: rowIndex,
        homerOriginal: _.round(homerOriginal, 2),

        // naive: _.round(naive, 2),
        // naiveOriginalDiff: _.round(naiveOriginalDiff, 2),
        // naiveOriginalPct: _.round(naiveOriginalPct, 2),

        naiveClamped: _.round(naiveClamped, 2),
        mlr: _.round(mlr, 2),
      }
      result.push(featureWtihTarget)
      return result
    },
    []
  )
}

function mlrPrediction(
  trainedBatteryModel,
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMin,
  batteryMax
) {
  const feature = [prevBatteryEnergyContent, electricalProductionLoadDiff]
  const [unclamped] = trainedBatteryModel.predict(feature)
  return _.clamp(unclamped, batteryMin, batteryMax)
}

function naivePrediction(prevBatteryEnergyContent, electricalProductionLoadDiff) {
  return prevBatteryEnergyContent + electricalProductionLoadDiff
}

// This is currently battery model used
function naiveClampedPrediction(
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMin,
  batteryMax
) {
  // TODO: Should not apply round trip losses if value gets clamped
  const roundTripLosses = 0.01
  const unclamped =
    (prevBatteryEnergyContent + electricalProductionLoadDiff) * (1 - roundTripLosses)
  return _.clamp(unclamped, batteryMin, batteryMax)
}
