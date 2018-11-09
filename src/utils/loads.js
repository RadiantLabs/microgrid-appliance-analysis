import _ from 'lodash'
import { toJS } from 'mobx'
import { arrayInsert, setKeyOrder } from './general'

export function calcAvailableCapacity(table, { minBatteryEnergyContent }) {
  return _.map(table, (row, rowIndex) => {
    if (rowIndex === 0) {
      return { ...row, ...{ availableCapacity: 'availableCapacity' } }
    }
    if (rowIndex === 1) {
      return { ...row, ...{ availableCapacity: 'kW' } }
    }
    const excessElecProd = row['Excess Electrical Production']
    const energyContent = row['Generic 1kWh Lead Acid [ASM] Energy Content']
    const capacity = excessElecProd + energyContent - minBatteryEnergyContent
    return { ...row, ...{ availableCapacity: capacity } }
  })
}

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

  const results = _.map(tableData, (row, rowIndex, rows) => {
    if (rowIndex === 0) {
      return { ...row, ...addColumnTitles(columnInfo) }
    }
    if (rowIndex === 1) {
      return { ...row, ...columnInfo }
    }

    // Grab existing values for this row:
    const excessElecProd = row['Excess Electrical Production']
    const energyContent = row['Generic 1kWh Lead Acid [ASM] Energy Content']
    const unmetElecLoad = row['Unmet Electrical Load']

    // Grab values from previous row
    const prevRow = rowIndex < 3 ? {} : rows[rowIndex - 1]
    const prevEnergyContent =
      prevRow['Generic 1kWh Lead Acid [ASM] Energy Content']

    // Calculate new values:
    const newApplianceLoad = row['appliance_load'] // TODO: This will be calculated based on field
    const availableCapacity =
      excessElecProd + energyContent - minBatteryEnergyContent
    const newAvailableCapacity = availableCapacity - newApplianceLoad
    const newUnmetLoad = newAvailableCapacity > 0 ? 0 : -newAvailableCapacity
    const totalUnmetLoad = unmetElecLoad + newUnmetLoad
    const newApplianceBatteryConsumption =
      newApplianceLoad > excessElecProd ? newApplianceLoad - excessElecProd : 0

    // Original Battery Energy Content Delta
    const prevBatteryEnergyContentDelta =
      rowIndex < 3 ? 0 : energyContent - prevEnergyContent

    // New Battery Energy Content
    // const newBatteryEnergyContent =
    //   prevNewBatteryEnergyContent + // Is this even available yet? This was calculated and returned in the last row
    //   prevBatteryEnergyContentDelta -
    //   newApplianceBatteryConsumption

    return {
      ...row,
      ...{
        _availableCapacity: _.round(availableCapacity, 2),
        _newAvailableCapacity: _.round(newAvailableCapacity, 2),
        _newUnmetLoad: _.round(newUnmetLoad, 2),
        _totalUnmetLoad: _.round(totalUnmetLoad, 2),
        _newApplianceBatteryConsumption: _.round(
          newApplianceBatteryConsumption,
          2
        ),
        _prevBatteryEnergyContentDelta: _.round(
          prevBatteryEnergyContentDelta,
          3
        ),
      },
    }
  })

  return { tableData: results, keyOrder: keyOrder.concat(_.keys(columnInfo)) }
}
