import _ from 'lodash'
import { predictBatteryEnergyContent } from './predictBatteryEnergyContent'

/**
 * Pass in the merged table that includes Homer and summed appliance calculated columnms.
 * Also pass in adjustable fields from store that are required
 * to do the calculations
 */
export function calcHybridColumns(grid, summedAppliances) {
  if (_.isEmpty(grid) || _.isEmpty(grid.fileData) || _.isEmpty(summedAppliances)) {
    return []
  }
  const { batteryMinEnergyContent, batteryMaxEnergyContent } = grid

  // Reducer function. This is needed so that we can have access to values in
  // rows we previously calculated
  const columnReducer = (result, homerRow, rowIndex, homerRows) => {
    // Get the matching row for the appliance
    const applianceRow = summedAppliances[rowIndex]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex === 0 ? {} : result[rowIndex - 1]

    // Calculated (summed) loads from new enabled appliances
    const newAppliancesLoad = applianceRow['newAppliancesLoad']
    const totalElectricalProduction = homerRow['Total Renewable Power Output']

    // 'Load Served' implies it was actually served, instead of just load demand.
    // We want to calculate the battery energy content. Then, from that, the unmet load.
    // In reality, there is no difference between 'load served' and just 'load' because
    // if the grid goes down, there is no load. We will assume there is a generator
    // on the grid, and then calculate economics based on unmet load costs/kWh
    // So adding newAppliancesLoad to a 'load served' value I think makes sense.
    const totalElectricalLoadServed =
      homerRow['Original Electrical Load Served'] +
      newAppliancesLoad +
      applianceRow['newAppliancesAncillaryLoad']

    // This value is important for predicting the battery energy content based on new loads
    // It's positive if battery is charging, negative if battery is discharging
    const electricalProductionLoadDiff = totalElectricalProduction - totalElectricalLoadServed

    // Predict battery energy content. From that we can calculate new unmet load
    const prevBatteryEnergyContent =
      rowIndex === 0 ? homerRow['originalBatteryEnergyContent'] : prevResult['batteryEnergyContent']

    const { batteryEnergyContent, newExcessProduction, newUnmetLoad } = predictBatteryEnergyContent(
      {
        rowIndex,
        prevBatteryEnergyContent,
        electricalProductionLoadDiff,
        batteryMinEnergyContent,
        batteryMaxEnergyContent,
      }
    )

    // == Calculate Unmet Load =================================================
    // Some of these numbers from HOMER are -1x10-16. Rounding makes them reasonable
    const originalUnmetLoad = _.round(homerRow['Original Unmet Electrical Load'], 6)
    const additionalUnmetLoad = newUnmetLoad - originalUnmetLoad

    // =========================================================================
    result.push({
      hour: homerRow['hour'],
      datetime: homerRow['Time'],
      hour_of_day: applianceRow['hour_of_day'],
      day: applianceRow['day'],
      day_hour: applianceRow['day_hour'],
      newAppliancesLoad: _.round(newAppliancesLoad, 4),
      // availableCapacityAfterNewLoad: _.round(availableCapacityAfterNewLoad, 4),
      batteryEnergyContent: _.round(batteryEnergyContent, 4),
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      totalElectricalLoadServed: _.round(totalElectricalLoadServed, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),

      // See note in README.md about how many decimal places to round unmet load
      originalUnmetLoad: _.round(originalUnmetLoad, 1),
      additionalUnmetLoad: _.round(additionalUnmetLoad, 1),
      newUnmetLoad: _.round(newUnmetLoad, 1),

      newExcessProduction: _.round(newExcessProduction, 4),
    })
    return result
  }

  // Iterate over homer data, pushing each new row into an array
  return _.reduce(grid.fileData, columnReducer, [])
}
