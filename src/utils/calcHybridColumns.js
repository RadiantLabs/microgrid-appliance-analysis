import _ from 'lodash'

/**
 * Pass in the merged table that includes Homer and summed appliance calculated columnms.
 * Also pass in adjustable fields from store that are required
 * to do the calculations
 */
export function calcHybridColumns(grid, summedAppliances, batteryColumns) {
  if (
    _.isEmpty(grid) ||
    _.isEmpty(grid.fileData) ||
    _.isEmpty(summedAppliances) ||
    _.isEmpty(batteryColumns)
  ) {
    return null
  }

  const { predictedBatteryEnergyContent } = batteryColumns
  console.log('batteryColumns: ', batteryColumns)
  console.log('predictedBatteryEnergyContent: ', predictedBatteryEnergyContent)

  const t0 = performance.now()
  const { batteryMinEnergyContent, batteryMinSoC } = grid

  // Reducer function. This is needed so that we can have access to values in
  // rows we previously calculated
  const columnReducer = (result, row, rowIndex, rows) => {
    // Get the previous HOMER row (from the original rows, not the new calculated rows)
    const prevRow = rowIndex === 0 ? {} : rows[rowIndex - 1]

    // Get the matching row for the appliance
    const applianceRow = summedAppliances[rowIndex]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex === 0 ? {} : result[rowIndex - 1]

    // Get existing values from the current row we are iterating over:
    // Excess electrical production:  Original energy production minus original load (not new
    // summedAppliances) when the battery is charging as fast as possible
    const excessElecProd = row['Excess Electrical Production']
    const batteryEnergyContent = row['Original Battery Energy Content']
    const batterySOC = row['Battery State of Charge']

    const prevBatteryEnergyContent =
      rowIndex === 0 ? row['Original Battery Energy Content'] : prevRow['Original Battery Energy Content']

    // Some of these numbers from HOMER are -1x10-16
    const originalUnmetLoad = _.round(row['Unmet Electrical Load'], 6)

    // Calculated (summed) loads from new enabled appliances
    const newAppliancesLoad = applianceRow['newAppliancesLoad']

    /*
     * Now calculate new values based on the HOMER and usage profiles
     */
    // The energy content above what HOMER (or the user) decides is the minimum
    // Energy content the battery should have
    const energyContentAboveMin = batteryEnergyContent - batteryMinEnergyContent

    // Find available capacity (kW) before the new appliance is added
    const availableCapacity =
      excessElecProd + (batterySOC <= batteryMinSoC ? 0 : energyContentAboveMin)

    // Find available capacity after the new appliance is added
    const availableCapacityAfterNewLoad = availableCapacity - newAppliancesLoad

    // Is there an unmet load after the new appliance is added?
    // If there is no available capacity (or goes negative) after the new appliance
    // is added, then the unmet load equals that (negative) "available" capacity
    const additionalUnmetLoad =
      availableCapacityAfterNewLoad > 0 ? 0 : -availableCapacityAfterNewLoad

    // Add up the original unmet load with no new appliance and now the additional
    // unmet load now that we have a new appliance on the grid
    const newTotalUnmetLoad = originalUnmetLoad + additionalUnmetLoad

    // Battery consumption (kW) now that we have a new appliance on the grid.
    // If the new appliance load is greater than the excess electrical production, we are
    // draining the battery by the difference between new load and the excess production.
    // If the excess electrical production is greater than the new appliance load, then we
    // aren't draining the battery.
    // excessElecProd is the excess after taking into acount the original load
    const newApplianceBatteryConsumption =
      newAppliancesLoad > excessElecProd ? newAppliancesLoad - excessElecProd : 0

    // Original Original Battery Energy Content Delta
    // This is how much the energy content in the battery has increased or decreased in
    // the last hour. First row is meaningless when referencing previous row, so set it to zero
    const originalBatteryEnergyContentDelta =
      rowIndex === 0 ? 0 : batteryEnergyContent - prevBatteryEnergyContent

    // New Appliance Battery Energy Content:
    // The battery energy content under the scenario of adding a new appliance.
    // This requires us to look at the energy content of the battery from the previous hour,
    // which means we need to look at the previous row than the one we are iterating over.
    // This is why these values are being calculated in a reducing function instead of a map
    const prevNewApplianceBatteryEnergyContent =
      rowIndex === 0 ? 0 : prevResult['newApplianceBatteryEnergyContent']

    const newApplianceBatteryEnergyContent =
      rowIndex === 0
        ? // For the first hour: We just look at the energy content of the battery
          // and how much a new appliance would use from the battery:
          batteryEnergyContent - newApplianceBatteryConsumption
        : // For hours after that, we need to take the perspective of the battery if a new
          // appliance was added. Take the battery energy content we just calculated from the
          // previous hour:
          prevNewApplianceBatteryEnergyContent +
          // Add how much energy content was added or removed from the original load:
          originalBatteryEnergyContentDelta -
          // Now subtract out any battery consumption the new appliance would use
          newApplianceBatteryConsumption

    // Unmet load counts are very sensitive to how many decimals you round to
    // Rounding to 3 decimals filters out loads less than 1 watthour
    // Rounding to 0 decimals filters out loads less than 1 kWh
    // Amanda decided to filter out anything less than 100 watthours (1 decimal)
    result.push({
      hour: row['hour'],
      datetime: row['Time'],
      hour_of_day: applianceRow['hour_of_day'],
      day: applianceRow['day'],
      day_hour: applianceRow['day_hour'],
      newAppliancesLoad: _.round(newAppliancesLoad, 4),
      availableCapacityAfterNewLoad: _.round(availableCapacityAfterNewLoad, 4),
      originalUnmetLoad: _.round(originalUnmetLoad, 1),
      additionalUnmetLoad: _.round(additionalUnmetLoad, 1),
      newTotalUnmetLoad: _.round(newTotalUnmetLoad, 1),
      newApplianceBatteryConsumption: _.round(newApplianceBatteryConsumption, 4),
      newApplianceBatteryEnergyContent: _.round(newApplianceBatteryEnergyContent, 4),
    })
    return result
  }

  // Iterate over homer data, pushing each new row into an array
  const hybridColumns = _.reduce(grid.fileData, columnReducer, [])
  const t1 = performance.now()
  console.log('calculateNewColumns took ' + _.round(t1 - t0) + ' milliseconds.')
  return hybridColumns
}
