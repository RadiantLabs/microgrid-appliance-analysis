import _ from 'lodash'

// This function gives us the battery energy content as if there are no new appliances
// on the grid. This should match what HOMER provides. By calculing this version,
// I can minimize the errors
export function predictOriginalBatteryEnergyContent(
  homerColumns,
  batteryMinEnergyContent,
  batteryMaxEnergyContent
) {
  if (_.isEmpty(homerColumns) || !batteryMinEnergyContent || !batteryMaxEnergyContent) {
    return []
  }
  const columnReducer = (result, row, rowIndex, rows) => {
    const prevResult = result[rowIndex - 1]

    // For first hour's prediction, use energy content from original HOMER file
    const prevBatteryEnergyContent =
      rowIndex === 0
        ? row['originalBatteryEnergyContent']
        : prevResult['originalModeledBatteryEnergyContent']

    const {
      batteryEnergyContent: originalModeledBatteryEnergyContent,
      newExcessProduction,
      newUnmetLoad,
    } = predictBatteryEnergyContent({
      rowIndex,
      prevBatteryEnergyContent,
      electricalProductionLoadDiff: row['originalElectricalProductionLoadDiff'],
      batteryMinEnergyContent,
      batteryMaxEnergyContent,
    })
    result.push({
      ...row,
      ...{
        originalModeledBatteryEnergyContent: _.round(originalModeledBatteryEnergyContent, 4),
        originalModeledExcessProduction: _.round(newExcessProduction, 4),
        originalModeledUnmetLoad: _.round(newUnmetLoad, 1),
      },
    })
    return result
  }
  return _.reduce(homerColumns, columnReducer, [])
}

// See explanation in README why I'm predicting the battery model like I am.
// roundTripLosses is for any losses in the battery charge/discharge cycle.
// This is found by trial and error minimizing losses against the original battery
// model from HOMER
export function predictBatteryEnergyContent({
  rowIndex,
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMinEnergyContent,
  batteryMaxEnergyContent,
  roundTripLosses = 0.01,
}) {
  // For first hour's prediction, use energy content from original HOMER file.
  // Since excess production and unmet loads don't depend on previous values,
  // set them to zero for the first row to make it simpler.
  if (rowIndex === 0) {
    return {
      batteryEnergyContent: prevBatteryEnergyContent,
      newExcessProduction: 0,
      newUnmetLoad: 0,
    }
  }

  const unclamped = prevBatteryEnergyContent * (1 - roundTripLosses) + electricalProductionLoadDiff
  const clamped = _.clamp(unclamped, batteryMinEnergyContent, batteryMaxEnergyContent)

  const newExcessProduction = unclamped - clamped > 0 ? unclamped - clamped : 0
  const newUnmetLoad = unclamped - clamped < 0 ? Math.abs(unclamped - clamped) : 0

  return {
    batteryEnergyContent: clamped,
    newExcessProduction: _.round(newExcessProduction, 4),
    newUnmetLoad: _.round(newUnmetLoad, 4),
  }
}
