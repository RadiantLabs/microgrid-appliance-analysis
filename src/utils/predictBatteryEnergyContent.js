import _ from 'lodash'

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
