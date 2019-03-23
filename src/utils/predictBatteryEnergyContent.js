import _ from 'lodash'

// This is for any losses in the battery charge/discharge cycle. This is found by trial and error
// minimizing losses against the original battery model from HOMER
const roundTripLosses = 0.1

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
    // For first hour's prediction, use energy content from original HOMER file
    if (rowIndex === 0) {
      result.push({
        ...row,
        ...{ originalModeledBatteryEnergyContent: _.round(row['originalBatteryEnergyContent'], 4) },
      })
      return result
    }

    // Now predict the rest of the rows
    const prevResult = result[rowIndex - 1]
    const prevBatteryEnergyContent = prevResult['originalModeledBatteryEnergyContent']
    const originalModeledBatteryEnergyContent = predictBatteryEnergyContent(
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

export function predictBatteryEnergyContent(
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMinEnergyContent,
  batteryMaxEnergyContent
) {
  // TODO: Explain why this calculation is so simple but is very accurate
  const unclampedBatteryEnergyContent =
    prevBatteryEnergyContent * (1 - roundTripLosses) + electricalProductionLoadDiff

  // TODO: Explain why clamping saves the day
  return _.clamp(unclampedBatteryEnergyContent, batteryMinEnergyContent, batteryMaxEnergyContent)
}
