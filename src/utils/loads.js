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
export function calculateNewLoads({ table, fields, tableStats, constants }) {
  const { tableData, keyOrder } = table
  const { minBatteryEnergyContent } = tableStats

  const columnInfo = {
    availableCapacity: 'kW',
    availableCapacityAfterNewLoad: 'kW',
    newUnmetLoad: 'kW',
    newApplianceBatteryConsumption: 'kW',
    originalBatteryEnergyContentDelta: 'kWh',
    newApplianceBatteryEnergyContent: 'kWh',
    totalUnmetLoad: 'kW',
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
    const prevRow = rowIndex < 3 ? {} : rows[rowIndex - 1]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex < 3 ? {} : result[rowIndex - 1]

    // Get existing values from this row:
    const excessElecProd = row['Excess Electrical Production']
    const batteryEnergyContent = row['Generic 1kWh Lead Acid [ASM] Energy Content']
    const unmetElecLoad = row['Unmet Electrical Load']

    // Get values from previous row
    const prevBatteryEnergyContent = prevRow['Generic 1kWh Lead Acid [ASM] Energy Content']

    // Calculate new values:
    const newApplianceLoad = row['appliance_load'] // TODO: This will be calculated based on field
    const availableCapacity = excessElecProd + batteryEnergyContent - minBatteryEnergyContent
    const availableCapacityAfterNewLoad = availableCapacity - newApplianceLoad
    const newUnmetLoad = availableCapacityAfterNewLoad > 0 ? 0 : -availableCapacityAfterNewLoad
    const totalUnmetLoad = unmetElecLoad + newUnmetLoad
    const newApplianceBatteryConsumption =
      newApplianceLoad > excessElecProd ? newApplianceLoad - excessElecProd : 0

    // Original Battery Energy Content Delta
    const originalBatteryEnergyContentDelta =
      rowIndex === 2 ? 0 : batteryEnergyContent - prevBatteryEnergyContent

    // New Battery Energy Content: This is the hard one and why we need a reducer function instead of map
    const prevNewApplianceBatteryEnergyContent =
      rowIndex === 2 ? 0 : prevResult['newApplianceBatteryEnergyContent']

    const newApplianceBatteryEnergyContent =
      rowIndex === 2
        ? batteryEnergyContent + newApplianceBatteryConsumption
        : prevNewApplianceBatteryEnergyContent +
          originalBatteryEnergyContentDelta -
          newApplianceBatteryConsumption

    result.push({
      ...row,
      ...{
        availableCapacity: _.round(availableCapacity, 2),
        availableCapacityAfterNewLoad: _.round(availableCapacityAfterNewLoad, 2),
        newUnmetLoad: _.round(newUnmetLoad, 2),
        newApplianceBatteryConsumption: _.round(newApplianceBatteryConsumption, 2),
        originalBatteryEnergyContentDelta: _.round(originalBatteryEnergyContentDelta, 3),
        newApplianceBatteryEnergyContent: _.round(newApplianceBatteryEnergyContent, 3),
        totalUnmetLoad: _.round(totalUnmetLoad, 2),
      },
    })
    return result
  }

  // Iterate over tableData, pushing each new row into an array
  const withNewColumns = _.reduce(tableData, columnReducer, [])
  const keys = _.keys(columnInfo).concat(keyOrder)

  return {
    tableData: withNewColumns,
    keyOrder: ['hour', 'Time'].concat(_.without(keys, ...['hour', 'Time'])),
  }
}
