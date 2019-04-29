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
      totalExcessProduction,
      totalUnmetLoad,
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
        originalModeledExcessProduction: _.round(totalExcessProduction, 4),
        originalModeledUnmetLoad: _.round(totalUnmetLoad, 1),
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
      totalExcessProduction: 0,
      totalUnmetLoad: 0,
    }
  }

  const unclamped = predict(electricalProductionLoadDiff, prevBatteryEnergyContent, roundTripLosses)
  const clamped = _.clamp(unclamped, batteryMinEnergyContent, batteryMaxEnergyContent)

  const totalExcessProduction = unclamped - clamped > 0 ? unclamped - clamped : 0 // always positive
  const totalUnmetLoad = unclamped - clamped < 0 ? clamped - unclamped : 0 // always positive
  return {
    batteryEnergyContent: clamped,
    totalExcessProduction: _.round(totalExcessProduction, 4),
    totalUnmetLoad: _.round(totalUnmetLoad, 4),
  }
}

export function predict(electricalProductionLoadDiff, prevBatteryEnergyContent, roundTripLosses) {
  return (prevBatteryEnergyContent + electricalProductionLoadDiff) * (1 - roundTripLosses)
}
