import _ from 'lodash'
// import { toJS } from 'mobx'
import { arrayInsert, findColMin, findColMax } from './utils'
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

// Sort keys manually (key order in objects is never deterministic) so I can put
// columns I want as fixed columns
export function setKeyOrder(rows) {
  const frontItems = ['hour']
  const keys = _.keys(rows[0])
  return frontItems.concat(_.without(keys, ...frontItems))
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

// Merge tables based on 'hour' key, taking into account the 2 table headers
// For now, this will only merge 2 tables. table2 cannot be an array of tables
export function mergeTables(table1, table2, headerCount = 2, joinKey = 'hour') {
  if (
    _.isEmpty(table1) ||
    !_.isArray(table1) ||
    _.isEmpty(table2) ||
    !_.isArray(table2)
  ) {
    return null
  }
  const table1Headers = _.take(table1, headerCount)
  const table1Data = _.drop(table1, headerCount)
  const table2Headers = _.take(table2[0], headerCount)
  const table2Data = _.drop(table2[0], headerCount)
  const mergedTable = _(table1Data)
    .concat(table2Data) // Can list multiple arrays to concat here, including calculated columns
    .groupBy(joinKey)
    .map(_.spread(_.merge))
    .value()

  const headerTitles = { ...table1Headers[0], ...table2Headers[0] }
  const headerUnits = { ...table1Headers[1], ...table2Headers[1] }
  return {
    tableData: [headerTitles, headerUnits].concat(mergedTable),
    keyOrder: setKeyOrder(mergedTable),
  }
}

// This function isn't really used yet - it will be expanded and generalized
export function addColumns(table, headerTitle, headerUnit) {
  const withColumn = _.map(table.tableData, (row, index) => {
    switch (index) {
      case 0:
        return { ...row, ...{ [headerTitle]: headerTitle } }
      case 1:
        return { ...row, ...{ [headerTitle]: headerUnit } }
      default:
        return { ...row, ...{ [headerTitle]: 5 } }
    }
  })
  return {
    tableData: withColumn,
    keyOrder: arrayInsert(table.keyOrder, headerTitle, 1),
  }
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
