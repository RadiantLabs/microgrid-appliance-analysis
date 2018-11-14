import _ from 'lodash'
// import { toJS } from 'mobx'
// import { arrayInsert, setKeyOrder } from './general'

export function addColumnTitles(columnInfo) {
  return _.mapValues(columnInfo, (val, key) => key)
}

/**
 * Pass in the merged table that includes Homer and Usage factors
 * Also pass in adjustable fields from store and constants that are required
 * to do the calculations
 */
export function calculateNewLoads({
  table,
  modelInputs,
  homerStats,
  constants,
}) {
  const { tableData, keyOrder } = table
  const {
    effectiveMinBatteryEnergyContent,
    minBatteryStateOfCharge,
  } = homerStats
  const headerRowCount = 2

  const columnInfo = {
    newApplianceLoad: 'kW',
    availableCapacity: 'kW',
    availableCapacityAfterNewLoad: 'kW',
    additionalUnmetLoad: 'kW',
    newApplianceBatteryConsumption: 'kW',
    originalBatteryEnergyContentDelta: 'kWh',
    newApplianceBatteryEnergyContent: 'kWh',
    newTotalUnmetLoad: 'kW',
  }

  // Reducer function. This is needed so that we can have access to values in
  // rows we previously calculated
  const columnReducer = (result, row, rowIndex, rows) => {
    // Deal with top 2 header rows
    if (rowIndex === 0) {
      result.push({ ...row, ...addColumnTitles(columnInfo) })
      return result
    }
    if (rowIndex === 1) {
      result.push({ ...row, ...columnInfo })
      return result
    }

    // Get the previous row (from the original rows, not the new calculated rows)
    const prevRow = rowIndex <= headerRowCount ? {} : rows[rowIndex - 1]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex <= headerRowCount ? {} : result[rowIndex - 1]

    // Get existing values from the current row we are iterating over:
    // Excess electrical production:  Original energy production minus original load (not new
    // appliances) when the battery is charging as fast as possible
    const excessElecProd = row['Excess Electrical Production']
    const batteryEnergyContent =
      row['Generic 1kWh Lead Acid [ASM] Energy Content']
    const batteryStateOfCharge =
      row['Generic 1kWh Lead Acid [ASM] State of Charge']
    const unmetElecLoad = row['Unmet Electrical Load']

    // Get values from previous row
    const prevBatteryEnergyContent =
      prevRow['Generic 1kWh Lead Acid [ASM] Energy Content']

    // Calculate load profile from usage profile
    const newApplianceLoad =
      row['kw_factor'] *
      modelInputs['kwFactorToKw'] *
      modelInputs['dutyCycleDerateFactor']

    if (!_.isFinite(newApplianceLoad)) {
      throw new Error(
        `newApplianceLoad did not calculate properly. Check your file has all required columns and that all values are finite. Row: ${JSON.stringify(
          row
        )}. Also make sure modelInputs are numbers and not strings or undefined: ${JSON.stringify(
          modelInputs
        )}`
      )
    }

    /*
     * Now calculate new values based on the HOMER and usage profiles
     */
    // This is the energy content above what HOMER (or the user) decides is the minimum
    // Energy content the battery should have
    const energyContentAboveMin =
      batteryEnergyContent - effectiveMinBatteryEnergyContent

    // Find available capacity (kW) before the new appliance is added
    const availableCapacity =
      excessElecProd +
      (batteryStateOfCharge <= minBatteryStateOfCharge
        ? 0
        : energyContentAboveMin)

    // Find available capacity after the new appliance is added
    const availableCapacityAfterNewLoad = availableCapacity - newApplianceLoad

    // Is there an unmet load after the new appliance is added?
    // If there is no available capacity (or goes negative) after the new appliance is added,
    // then the unmet load equals that (negative) "available" capacity
    const additionalUnmetLoad =
      availableCapacityAfterNewLoad > 0 ? 0 : -availableCapacityAfterNewLoad

    // Add up the original unmet load with no new appliance and now the additional unmet load
    // now that we have a new appliance on the grid
    const newTotalUnmetLoad = unmetElecLoad + additionalUnmetLoad

    // What is the battery consumption (kW) now that we have a new appliance on the grid?
    // If the new appliance load is greater than the excess electrical production, we are
    // draining the battery by the difference between new load and the excess production.
    // If the excess electrical production is greater than the new appliance load, then we
    // aren't draining the battery.
    // excessElecProd is the excess after taking into acount the original load
    const newApplianceBatteryConsumption =
      newApplianceLoad > excessElecProd ? newApplianceLoad - excessElecProd : 0

    // Original Battery Energy Content Delta
    // This is how much the energy content in the battery has increased or decreased in
    // the last hour. Takes into account the 2 column headers that are text, not real values
    const originalBatteryEnergyContentDelta =
      rowIndex <= headerRowCount
        ? 0
        : batteryEnergyContent - prevBatteryEnergyContent

    // New Appliance Battery Energy Content:
    // The battery energy content under the scenario of adding a new appliance.
    // This requires us to look at the energy content of the battery from the previous hour,
    // which means we need to look at the previous row than the one we are iterating over.
    // This is why these values are being calculated in a reducing function instead of a map
    const prevNewApplianceBatteryEnergyContent =
      rowIndex <= headerRowCount
        ? 0
        : prevResult['newApplianceBatteryEnergyContent']
    const newApplianceBatteryEnergyContent =
      rowIndex <= headerRowCount
        ? // For the first hour (row 3 if there are 2 header rows):
          // We just look at the energy content of the battery and
          // how much a new appliance would use from the battery:
          batteryEnergyContent - newApplianceBatteryConsumption
        : // For hours after that, we need to take the perspective of the battery if a new
          // appliance was added. Take the battery energy content we just calculated from the
          // previous hour:
          prevNewApplianceBatteryEnergyContent +
          // Add how much energy content was added or removed from the original load:
          originalBatteryEnergyContentDelta -
          // Now subtract out any battery consumption the new appliance would use
          newApplianceBatteryConsumption

    result.push({
      ...row,
      ...{
        newApplianceLoad: _.round(newApplianceLoad, 3),
        energyContentAboveMin: _.round(energyContentAboveMin, 3),
        availableCapacity: _.round(availableCapacity, 3),
        availableCapacityAfterNewLoad: _.round(
          availableCapacityAfterNewLoad,
          3
        ),
        additionalUnmetLoad: _.round(additionalUnmetLoad, 3),
        newApplianceBatteryConsumption: _.round(
          newApplianceBatteryConsumption,
          3
        ),
        originalBatteryEnergyContentDelta: _.round(
          originalBatteryEnergyContentDelta,
          3
        ),
        newApplianceBatteryEnergyContent: _.round(
          newApplianceBatteryEnergyContent,
          3
        ),
        newTotalUnmetLoad: _.round(newTotalUnmetLoad, 3),
      },
    })
    return result
  }

  // Iterate over tableData, pushing each new row into an array
  const withNewColumns = _.reduce(tableData, columnReducer, [])
  const keys = _.keys(columnInfo).concat(keyOrder)
  const frontColumns = ['hour', 'Time', 'newApplianceLoad']
  return {
    tableData: withNewColumns,
    keyOrder: frontColumns.concat(_.without(keys, ...frontColumns)),
  }
}
