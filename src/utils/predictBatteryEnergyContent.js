import _ from 'lodash'

// This is for any losses in the battery charge/discharge cycle. This is found by trial and error
// minimizing losses against the original battery model from HOMER
const roundTripLosses = 0.01

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

    const originalModeledBatteryEnergyContent = predictBatteryEnergyContent(
      rowIndex,
      prevBatteryEnergyContent,
      row['originalElectricalProductionLoadDiff'],
      batteryMinEnergyContent,
      batteryMaxEnergyContent
    )
    result.push({
      ...row,
      ...{ originalModeledBatteryEnergyContent: _.round(originalModeledBatteryEnergyContent, 4) },
    })
    return result
  }
  return _.reduce(homerColumns, columnReducer, [])
}

// See explanation in README why I'm predicting the battery model like I am.
export function predictBatteryEnergyContent(
  rowIndex,
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMinEnergyContent,
  batteryMaxEnergyContent
) {
  // For first hour's prediction, use energy content from original HOMER file
  if (rowIndex === 0) {
    return prevBatteryEnergyContent
  }

  const unclampedBatteryEnergyContent =
    prevBatteryEnergyContent * (1 - roundTripLosses) + electricalProductionLoadDiff

  return _.clamp(unclampedBatteryEnergyContent, batteryMinEnergyContent, batteryMaxEnergyContent)
}
