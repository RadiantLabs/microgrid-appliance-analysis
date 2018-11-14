import _ from 'lodash'
// import { toJS } from 'mobx'
import {
  findColMin,
  findColMax,
  setKeyOrder,
  sumGreaterThanZero,
  countGreaterThanZero,
  percentOfYear,
  createGreaterThanZeroHistogram,
  mergeArraysOfObjects,
  remapKeyInArrayOfObjects,
} from './general'
import Papa from 'papaparse'
const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }

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
export function processHomerFile(rows, fileInfo) {
  const headerRow = createHeaderRow(rows)
  const tableData = [headerRow].concat(rows)
  const addedHour = addHourIndex(tableData)
  const keyOrder = setKeyOrder(addedHour)
  return { tableData: addedHour, keyOrder, fileInfo }
}

export function processApplianceFile(rows, fileInfo) {
  const unitRow = {
    datetime: '-',
    hour: '-',
    day: '-',
    hour_of_day: '-',
    day_hour: '-',
    kw_factor: '-',
    production_factor: '-',
  }
  const keyOrder = _.keys(unitRow)
  const incomingColumns = _.keys(rows[0])
  if (!_.isEqual(keyOrder, incomingColumns)) {
    throw new Error(
      `Missing a required column in appliance file: Passed in ${JSON.stringify(
        incomingColumns
      )}. Required is ${JSON.stringify(keyOrder)}`
    )
  }
  const tableData = [createHeaderRow(rows), unitRow].concat(rows)
  return { tableData, keyOrder, fileInfo }
}

export function getHomerStats(homer) {
  const minBatteryEnergyContent = findColMin(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] Energy Content'
  )
  const maxBatteryEnergyContent = findColMax(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] Energy Content'
  )
  // Absolute minimum battery state of charge
  const minBatteryStateOfCharge = findColMin(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] State of Charge'
  )
  const maxBatteryStateOfCharge = findColMax(
    homer.tableData,
    'Generic 1kWh Lead Acid [ASM] State of Charge'
  )

  // Effective Minimum Battery Energy Content
  // When creating a HOMER run, the user determines the minimum (suggested) percent that the
  // battery discharges. In theory, this determines the minimum energy content (kWh) of the
  // battery. But apparently there is a non-linear relationship with the charge percent (state
  // of charge) and the energy content.
  // HOMER starts out the year with a fully charged battery. It looks like HOMER only allows
  // the battery to get to the absolute minimum in the last few hours of the year. So the effective
  // minimum for most of the year is a little higher than that.

  // So to find the effective minimum energy content, first look up the absolute minimum state of
  // charge (minBatteryStateOfCharge) and round up to the nearest integer.
  // Then go down, hour-by-hour, looking for the first hour we get near that point
  // (within a value of 1, which is 1%).
  const minBatteryStateOfChargeRowId = _.findIndex(homer.tableData, row => {
    return (
      // Round up to nearest integer (ceil) of absolute min
      _.ceil(minBatteryStateOfCharge) >=
      // Will be greater than rounding down to nearest integer of the current row
      _.floor(row['Generic 1kWh Lead Acid [ASM] State of Charge'])
    )
  })
  // If no row meets this condition, just take the absolute min as a fallback.
  // I'm assuming effective min will be within 1% of absolute min, otherwise take absolute
  // That may not be an assumption we want to make.
  // We need to understand HOMER's algorithms better
  const effectiveMinBatteryEnergyContent =
    minBatteryStateOfChargeRowId > 0
      ? homer.tableData[minBatteryStateOfChargeRowId][
          'Generic 1kWh Lead Acid [ASM] Energy Content'
        ]
      : minBatteryStateOfCharge

  return {
    minBatteryEnergyContent,
    maxBatteryEnergyContent,
    effectiveMinBatteryEnergyContent,
    minBatteryStateOfCharge,
    maxBatteryStateOfCharge,
  }
}

export function getSummaryStats(combinedTable) {
  const { tableData } = combinedTable

  // Total kWh for the year
  const yearlyKwh = sumGreaterThanZero(tableData, 'newApplianceLoad')

  // Unmet Loads: Original without new appliance
  const originalUnmetLoadCount = countGreaterThanZero(
    tableData,
    'Unmet Electrical Load'
  )
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(
    tableData,
    'Unmet Electrical Load'
  )
  const originalUnmetLoadHistTemp = createGreaterThanZeroHistogram(
    tableData,
    'hour_of_day',
    'Unmet Electrical Load'
  )
  const originalUnmetLoadHist = remapKeyInArrayOfObjects(
    originalUnmetLoadHistTemp,
    'Unmet Electrical Load',
    'originalUnmetLoad'
  )

  // Unmet Loads: Additional Appliance
  const additionalUnmetLoadCount = countGreaterThanZero(
    tableData,
    'additionalUnmetLoad'
  )
  const additionalUnmetLoadCountPercent = percentOfYear(
    additionalUnmetLoadCount
  )
  const additionalUnmetLoadSum = sumGreaterThanZero(
    tableData,
    'additionalUnmetLoad'
  )
  const additionalUnmetLoadHist = createGreaterThanZeroHistogram(
    tableData,
    'hour_of_day',
    'additionalUnmetLoad'
  )

  // Unmet Loads: Total with new appliance
  const newTotalUnmetLoadCount = countGreaterThanZero(
    tableData,
    'newTotalUnmetLoad'
  )
  const newTotalUnmetLoadCountPercent = percentOfYear(newTotalUnmetLoadCount)
  const newTotalUnmetLoadSum = sumGreaterThanZero(
    tableData,
    'newTotalUnmetLoad'
  )
  const newTotalUnmetLoadHist = createGreaterThanZeroHistogram(
    tableData,
    'hour_of_day',
    'newTotalUnmetLoad'
  )

  const allUnmetLoadHist = mergeArraysOfObjects(
    'hour_of_day',
    originalUnmetLoadHist,
    additionalUnmetLoadHist,
    newTotalUnmetLoadHist
  )

  return {
    yearlyKwh: _.round(yearlyKwh),

    originalUnmetLoadCount,
    originalUnmetLoadCountPercent,
    originalUnmetLoadSum: _.round(originalUnmetLoadSum),
    originalUnmetLoadHist,

    additionalUnmetLoadCount,
    additionalUnmetLoadCountPercent,
    additionalUnmetLoadSum: _.round(additionalUnmetLoadSum),
    additionalUnmetLoadHist,

    newTotalUnmetLoadCount,
    newTotalUnmetLoadCountPercent,
    newTotalUnmetLoadSum: _.round(newTotalUnmetLoadSum),
    newTotalUnmetLoadHist,

    allUnmetLoadHist,
  }
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
        return processHomerFile(data, fileInfo)
      case 'appliance':
        return processApplianceFile(data, fileInfo)
      default:
        throw new Error(
          `File fetched does not have a known type: ${JSON.stringify(fileInfo)}`
        )
    }
  } catch (error) {
    console.error(
      `File load fail for : ${
        fileInfo.path
      }. Make sure appliance CSV has all headers.`,
      error
    )
  }
}
