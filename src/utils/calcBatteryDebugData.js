import _ from 'lodash'
import { trainMlrBatteryModel } from './trainMlrBatteryModel'

export function calcBatteryDebugData(combinedTable, batteryMin, batteryMax) {
  if (_.isEmpty(combinedTable) || !batteryMin || !batteryMax) {
    return []
  }
  const { trainedBatteryModel } = trainMlrBatteryModel(combinedTable)

  return _.reduce(
    combinedTable,
    (result, row, rowIndex, rows) => {
      const prevBatteryEnergyContent =
        rowIndex === 0
          ? row['originalBatteryEnergyContent']
          : rows[rowIndex - 1]['originalBatteryEnergyContent']

      const homerOriginal = row['originalBatteryEnergyContent']

      // _______________________________________________________________________
      // Naive Model with no clamping or efficiency loss
      // _______________________________________________________________________
      const naive = naivePrediction(
        prevBatteryEnergyContent,
        row['originalElectricalProductionLoadDiff']
      )
      const naiveOriginalDiff = naive - homerOriginal
      const naiveOriginalPct = (naiveOriginalDiff / homerOriginal) * 100

      // _______________________________________________________________________
      // Naive Model with clamping
      // _______________________________________________________________________
      // Currently the battery model is using the naiveClamped model
      const naiveClamped = row['batteryEnergyContent']

      // _______________________________________________________________________
      // MLR
      // _______________________________________________________________________
      const mlr = mlrPrediction(
        trainedBatteryModel,
        prevBatteryEnergyContent,
        row['electricalProductionLoadDiff'],
        batteryMin,
        batteryMax
      )

      // _______________________________________________________________________
      // Output results
      // _______________________________________________________________________
      const featureWtihTarget = {
        hour: rowIndex,
        homerOriginal: _.round(homerOriginal, 2),

        naive: _.round(naive, 2),
        naiveOriginalDiff: _.round(naiveOriginalDiff, 2),
        naiveOriginalPct: _.round(naiveOriginalPct, 2),

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

// This is currently battery model used, so I'm commenting this out and pulling
// the value from combinedTable
// function naiveClampedPrediction(
//   prevBatteryEnergyContent,
//   electricalProductionLoadDiff,
//   batteryMin,
//   batteryMax
// ) {
//   // TODO: Should not apply round trip losses if value gets clamped
//   const roundTripLosses = 0.01
//   // const roundTripLosses = 0
//   const unclamped =
//     (prevBatteryEnergyContent + electricalProductionLoadDiff) * (1 - roundTripLosses)
//   return _.clamp(unclamped, batteryMin, batteryMax)
// }
