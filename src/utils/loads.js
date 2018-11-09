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
    _availableCapacity: 'kW',
    _newAvailableCapacity: 'kW',
    _newUnmetLoad: 'kW',
    _totalUnmetLoad: 'kW',
    _newApplianceBatteryConsumption: 'kW',
    _prevBatteryEnergyContentDelta: 'kWh',
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

    // Grab existing values for this row:
    const excessElecProd = row['Excess Electrical Production']
    const energyContent = row['Generic 1kWh Lead Acid [ASM] Energy Content']
    const unmetElecLoad = row['Unmet Electrical Load']

    // Grab values from previous row
    const prevRow = rowIndex < 3 ? {} : rows[rowIndex - 1]
    const prevEnergyContent = prevRow['Generic 1kWh Lead Acid [ASM] Energy Content']

    // Calculate new values:
    const newApplianceLoad = row['appliance_load'] // TODO: This will be calculated based on field
    const availableCapacity = excessElecProd + energyContent - minBatteryEnergyContent
    const newAvailableCapacity = availableCapacity - newApplianceLoad
    const newUnmetLoad = newAvailableCapacity > 0 ? 0 : -newAvailableCapacity
    const totalUnmetLoad = unmetElecLoad + newUnmetLoad
    const newApplianceBatteryConsumption =
      newApplianceLoad > excessElecProd ? newApplianceLoad - excessElecProd : 0

    // Original Battery Energy Content Delta
    const prevBatteryEnergyContentDelta = rowIndex < 3 ? 0 : energyContent - prevEnergyContent

    // New Battery Energy Content: This is the hard one and why we need a reducer function instead of map
    // const newBatteryEnergyContent =
    //   prevNewBatteryEnergyContent + // Is this even available yet? This was calculated and returned in the last row
    //   prevBatteryEnergyContentDelta -
    //   newApplianceBatteryConsumption

    result.push({
      ...row,
      ...{
        _availableCapacity: _.round(availableCapacity, 2),
        _newAvailableCapacity: _.round(newAvailableCapacity, 2),
        _newUnmetLoad: _.round(newUnmetLoad, 2),
        _totalUnmetLoad: _.round(totalUnmetLoad, 2),
        _newApplianceBatteryConsumption: _.round(newApplianceBatteryConsumption, 2),
        _prevBatteryEnergyContentDelta: _.round(prevBatteryEnergyContentDelta, 3),
      },
    })
    return result
  }

  // Iterate over tableData, pushing each new row into an array
  const withNewColumns = _.reduce(tableData, columnReducer, [])

  return {
    tableData: withNewColumns,
    keyOrder: keyOrder.concat(_.keys(columnInfo)),
  }
}
