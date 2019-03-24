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

// How does this simple equation predict the kinetic batttery model so well?
// In my tests, I see:
// +/-2% average error
// 14% max error
// This is compared with a tensorflow model that had a 0.1 stop loss with 40 max epoch
// (usually one when to 27 epochs for a total training time of 70 seconds). I was getting
// +/- 4% average error. So why does this work?
// The most important factors in battery energy content are:
// 1. The previous hour's energy content
// 2. How much energy (kW over 1 hour) was added or removed from the battery
// There are dependencies on:
//    * Battery Degradation: I was seeing from HOMER a modeled drop of only 1 kWh
//      drop in min energy content over 1 year. Negligible, but I still split the
//      difference when calculating by averaging the mins energy content over a year
//    * Temperature: We don't have data on this yet. But it should be modelable
//    * Charge/discharge rate (Peukart effect): Hopefully all of these batteries
//      good charge controllers to ensure consistent, optimal charging.
//
// So to calculate energy content, take last hour's energy content and add the
// extra capacity of the system or subtract the load above what generation provides.
// `electricalProductionLoadDiff` the difference between production and battery load
// for every hour. It's positive if there is extra capacity (charging) or negative
// if the load is greater than generation (discharging batttery).
// There are losses between charging and discharging the battery. This will likely
// be nonlinear near the boundaries (battery min/max).
//
// Plotting the predicted values against the actual HOMER values (ignoring additional
// loads from appliances) let's us see how the prediction model does (as well as
// calculating average and max error). Trial and error, to give me the minimum
// average error with no bias, sets the roundTripLosses to be 0.01.
// Read next for why clamping saves the day.
export function predictBatteryEnergyContent(
  prevBatteryEnergyContent,
  electricalProductionLoadDiff,
  batteryMinEnergyContent,
  batteryMaxEnergyContent
) {
  const unclampedBatteryEnergyContent =
    prevBatteryEnergyContent * (1 - roundTripLosses) + electricalProductionLoadDiff

  // Why is clamping the prediction values important?
  // Since an important input to our prediction is our last prediction, the errors
  // can compound. Imagine the potential error for 8760 predictions, each one depending
  // on the previous one.
  // However, batteries have a nice property (for prediction) where the charge/discharge
  // is cyclical and has a min/max. So once the batttery is charged, it can't go above
  // the max. If half a charge cycle is 12 hours in a day, then we only have 12
  // prediction errors to compound.
  // If a system never fully charged or discharged it's battteries, or when hundreds of cycles
  // without hitting max or min, then this prediction model may be inaccurate.
  return _.clamp(unclampedBatteryEnergyContent, batteryMinEnergyContent, batteryMaxEnergyContent)
}
