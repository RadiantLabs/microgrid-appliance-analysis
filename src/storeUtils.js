import _ from 'lodash'
// import { toJS } from 'mobx'
import { arrayInsert } from './utils'
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

export function combineTables(activeHomer, activeAppliances) {
  if (_.isEmpty(activeHomer) || _.isEmpty(activeAppliances)) {
    return null
  }
  const headerRowCount = 2
  const homerHeaders = _.take(activeHomer.tableData, headerRowCount)
  const homerData = _.drop(activeHomer.tableData, headerRowCount)
  const applianceHeaders = _.take(activeAppliances[0].tableData, headerRowCount)
  const applianceData = _.drop(activeAppliances[0].tableData, headerRowCount)
  const mergedTable = _(homerData)
    .concat(applianceData) // Can list multiple arrays to concat here, including calculated columns
    .groupBy('hour')
    .map(_.spread(_.merge))
    .value()

  const headerTitles = { ...homerHeaders[0], ...applianceHeaders[0] }
  const headerUnits = { ...homerHeaders[1], ...applianceHeaders[1] }
  return {
    tableData: [headerTitles, headerUnits].concat(mergedTable),
    keyOrder: setKeyOrder(mergedTable),
  }
}

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
