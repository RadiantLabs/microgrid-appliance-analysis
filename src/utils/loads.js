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

/**
 * Pass in the merged table that includes Homer and Usage factors
 * Also pass in adjustable fields from store and constants that are required
 * to do the calculations
 * @param {*} table
 * @param {*} fields
 * @param {*} tableStats
 * @param {*} constants
 */
export function calculateNewLoads({ table, fields, tableStats, constants }) {
  const { tableData, keyOrder } = table
  const { minBatteryEnergyContent } = tableStats

  const newColumns = {
    _availableCapacity: 'kW',
    _newAvailableCapacity: 'kW',
    _newUnmetLoad: 'kW',
  }

  const results = _.map(tableData, (row, rowIndex) => {
    // TODO: Make this a little more elegant
    if (rowIndex === 0) {
      return {
        ...row,
        ...{
          _availableCapacity: '_availableCapacity',
          _newAvailableCapacity: '_newAvailableCapacity',
          _newUnmetLoad: '_newUnmetLoad',
        },
      }
    }
    if (rowIndex === 1) {
      return {
        ...row,
        ...{
          _availableCapacity: 'kW',
          _newAvailableCapacity: 'kW',
          _newUnmetLoad: 'kW',
        },
      }
    }

    // Grab existing values:
    const excessElecProd = row['Excess Electrical Production']
    const energyContent = row['Generic 1kWh Lead Acid [ASM] Energy Content']

    // Calculate new values:
    const newApplianceLoad = row['appliance_load'] // TODO: This will be calculated based on field
    const availableCapacity =
      excessElecProd + energyContent - minBatteryEnergyContent
    const newAvailableCapacity = availableCapacity - newApplianceLoad
    const newUnmetLoad = newAvailableCapacity > 0 ? 0 : -newAvailableCapacity

    return {
      ...row,
      ...{
        _availableCapacity: _.round(availableCapacity, 2),
        _newAvailableCapacity: _.round(newAvailableCapacity, 2),
        _newUnmetLoad: _.round(newUnmetLoad, 2),
      },
    }
  })

  return { tableData: results, keyOrder: keyOrder.concat(_.keys(newColumns)) }
}
