import _ from 'lodash'
// import { toJS } from 'mobx'
import { findColMin, findColMax, setKeyOrder } from './general'
import Papa from 'papaparse'
const csvOptions = { header: true, dynamicTyping: true }

// Return an object with the values the same as the key.
// This let's React Virtualized Grid component render the top row with the name
// of the column
// Can use any row, picking the 3rd in case the second row is units
export function createHeaderRow(rows) {
  const thirdRow = rows[2]
  return _.mapValues(thirdRow, (val, key) => key)
}

export function addHourIndex(rows, headerColumnCount = 2) {
  return _.map(rows, (row, rowIndex) => {
    const hour = rowIndex - headerColumnCount
    switch (hour) {
      case -2:
        return { ...row, ...{ hour: 'hour' } }
      case -1:
        return { ...row, ...{ hour: '-' } }
      default:
        return { ...row, ...{ hour: hour } }
    }
  })
}

// Convert output from raw CSV parse into something that React Virtualized
// can display
// Units come in as the first second row, header is the first but
// TODO: Parse date and reformat
export function processHomerFile(rows) {
  const headerRow = createHeaderRow(rows)
  const tableData = [headerRow].concat(rows)
  const addedHour = addHourIndex(tableData)
  const keyOrder = setKeyOrder(addedHour)
  return { tableData: addedHour, keyOrder }
}

export function processApplianceFile(rows) {
  const keyOrder = _.keys(rows[0])
  const unitRow = {
    datetime: '-',
    hour: '-',
    day: '-',
    hour_of_day: '-',
    day_hour: '-',
    kw_factor: '-',
    grain_factor: '-',
    kw: 'kW',
  }
  const tableData = [createHeaderRow(rows), unitRow].concat(rows)
  return { tableData, keyOrder }
}

export function calculateHomerStats(homer) {
  const minBatteryEnergyContent = findColMin(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] Energy Content'
  )
  const maxBatteryEnergyContent = findColMax(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] Energy Content'
  )
  return { minBatteryEnergyContent, maxBatteryEnergyContent }
}

/**
 * Fetch Homer or Usage profile files.
 * @param {*} fileInfo
 */
export async function fetchFile(fileInfo) {
  const { path, type } = fileInfo
  try {
    const res = await window.fetch(path)
    const csv = await res.text()
    const { data, errors } = Papa.parse(csv, csvOptions)
    if (!_.isEmpty(errors)) {
      throw new Error(`Problem parsing CSV: ${JSON.stringify(errors)}`)
    }
    switch (type) {
      case 'homer':
        return processHomerFile(data)
      case 'appliance':
        return processApplianceFile(data)
      default:
        throw new Error(
          `File fetched does not have a known type: ${JSON.stringify(fileInfo)}`
        )
    }
  } catch (error) {
    console.log(`File load fail for : ${JSON.stringify(fileInfo)} `, error)
  }
}
