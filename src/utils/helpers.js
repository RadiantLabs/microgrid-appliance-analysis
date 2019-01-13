import _ from 'lodash'
import { DateTime } from 'luxon'
import {
  HOURS_PER_YEAR,
  homerParseFormat,
  applianceParseFormat,
  tableDateFormat,
} from './constants'
import Papa from 'papaparse'
const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }
// window.LuxonDateTime = DateTime    // Used for debugging Luxon tokens

/**
 * These are more general purpose utility functions, not directly related to the store
 */

// Non-mutating array insert
export const arrayInsert = (arr, item, index) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}

export const checkKey = (table, key) => {
  if (!_.has(_.first(table), key)) {
    throw new Error(`Can't find key: ${key}: Check calling function`)
  }
}

// Check for a valid float, can pass in a string or number
// https://stackoverflow.com/a/52710457/1884101
export const isFloat = val => {
  if (val == null || ('' + val).trim() === '' || isNaN(+val)) {
    return false // not a float
  } else {
    return true
  }
}

// Check for a valid integer, can pass in a string or number
// https://stackoverflow.com/a/52710457/1884101
export const isInteger = val => {
  if (val == null || ('' + val).trim() === '' || ~~val !== +val) {
    return false // not an integer
  } else {
    return true
  }
}

export const filterNums = (table, key) => {
  checkKey(table, key)
  return _.chain(table)
    .map(key)
    .filter(_.isNumber)
    .value()
}

export const countGreaterThanZero = (table, key) => {
  checkKey(table, key)
  return _.chain(table)
    .map(key)
    .filter(_.isNumber)
    .filter(num => num > 0)
    .size()
    .value()
}

// There may be negative numbers when summing. This only sums positive.
export const sumGreaterThanZero = (table, key) => {
  checkKey(table, key)
  return _.chain(table)
    .map(key)
    .filter(_.isNumber)
    .filter(num => num > 0)
    .sum()
    .round(2)
    .value()
}

// Date formatting
export const isLuxonObject = val => {
  return _.isObject(val) && typeof val.fromISO == 'function'
}

export const isValidLuxonDate = dateObj => {
  return _.get(dateObj, 'isValid', false)
}

// Convert all dates from files into Luxon objects and then store them as ISO
// date strings (not date objects). ISO dates are long for display - If we need
// to display the dates, convert them from ISO to Luxon objects and back out to
// friendlier formats. It's more processing but storing the dates as Luxon objects
// instead of strings makes the app brittle
export const formatDateForTable = val => {
  const dateObj = DateTime.fromISO(val)
  return isValidLuxonDate(dateObj) ? dateObj.toFormat(tableDateFormat) : val
}

export const createGreaterThanZeroHistogram = (table, byKey, countKey, byKeyIsInteger = true) => {
  const counts = _.countBy(table, (row, rowIndex) => {
    if (!_.isNumber(row[byKey])) {
      return 'deleteme'
    }
    return row[countKey] > 0 ? row[byKey] : 'deleteme'
  })
  return _.map(_.omit(counts, 'deleteme'), (val, key) => ({
    [countKey]: val,
    [byKey]: byKeyIsInteger ? parseInt(key, 10) : key,
  }))
}

export const percentOfYear = count => {
  return _.isFinite(count) ? _.round((count / HOURS_PER_YEAR) * 100, 1) : '-'
}

// Pass in an array of objects and a key, finds the min value for that key.
// Note: _.minBy doesn't work when there are strings
export const findColMin = (table, key) => {
  return _.min(filterNums(table, key))
}

export const findColMax = (table, key) => {
  return _.max(filterNums(table, key))
}

// This lodash approach is ~100x faster than doing a iterating over
// arrays and merging row objects together with spread operator.
// This runs ~300ms the first time, ~100ms subsequent times.
// The other version took ~18 seconds
export function mergeArraysOfObjects(joinKey, arr1, ...arrays) {
  return _(arr1)
    .concat(...arrays) // Can list multiple arrays to concat here
    .groupBy(joinKey)
    .map(_.spread(_.merge))
    .value()
}

export function addColumnTitles(columnInfo) {
  return _.mapValues(columnInfo, (val, key) => key)
}

/**
 * Pass in the merged table that includes Homer and Usage factors
 * Also pass in adjustable fields from store and constants that are required
 * to do the calculations
 */
export function calculateNewLoads({ homer, appliance, modelInputs, homerStats, constants }) {
  const { effectiveMinBatteryEnergyContent, minbatterySOC } = homerStats
  const headerRowCount = 2

  const columnInfo = {
    hour: '-',
    datetime: '-',
    hour_of_day: '-',
    day: '-',
    day_hour: '-',
    // kw_factor: 'full cap./kW',
    totalElectricalProduction: 'kW',
    electricalProductionLoadDiff: 'kW',
    prevBatterySOC: '%',
    prevBatteryEnergyContent: 'kWh',
    newApplianceLoad: 'kW',
    availableCapacity: 'kW',
    availableCapacityAfterNewLoad: 'kW',
    additionalUnmetLoad: 'kW',
    newApplianceBatteryConsumption: 'kW',
    originalBatteryEnergyContentDelta: 'kWh',
    newApplianceBatteryEnergyContent: 'kWh',
    originalUnmetLoad: 'kW',
    newTotalUnmetLoad: 'kW',
  }

  // Reducer function. This is needed so that we can have access to values in
  // rows we previously calculated
  const columnReducer = (result, row, rowIndex, rows) => {
    // Deal with top 2 header rows
    if (rowIndex === 0) {
      result.push(addColumnTitles(columnInfo))
      return result
    }
    if (rowIndex === 1) {
      result.push(columnInfo)
      return result
    }

    // Get the previous HOMER row (from the original rows, not the new calculated rows)
    const prevRow = rowIndex <= headerRowCount ? {} : rows[rowIndex - 1]

    // Get the matching row for the appliance
    const applianceRow = appliance[rowIndex]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex <= headerRowCount ? {} : result[rowIndex - 1]

    // Get existing values from the current row we are iterating over:
    // Excess electrical production:  Original energy production minus original load (not new
    // appliances) when the battery is charging as fast as possible
    const excessElecProd = row['Excess Electrical Production']
    const batteryEnergyContent = row['Battery Energy Content']
    const batterySOC = row['Battery State of Charge']

    const prevBatteryEnergyContent =
      rowIndex <= headerRowCount ? row['Battery Energy Content'] : prevRow['Battery Energy Content']

    const prevBatterySOC =
      rowIndex <= headerRowCount
        ? row['Battery State of Charge']
        : prevRow['Battery State of Charge']

    // TODO: Eventually add other generation to this value
    const totalElectricalProduction = row['PV Power Output']

    // electricalProductionLoadDiff defines whether we are producing excess (positive)
    // or in deficit (negative).
    // If excess (positive), `Inverter Power Input` kicks in
    // If deficit (negative), `Rectifier Power Input` kicks in
    const electricalProductionLoadDiff =
      totalElectricalProduction - row['Total Electrical Load Served']

    // Some of these numbers from HOMER are -1x10-16
    const originalUnmetLoad = _.round(row['Unmet Electrical Load'], 6)

    // Calculate load profile from usage profile
    const newApplianceLoad =
      applianceRow['kw_factor'] * modelInputs['kwFactorToKw'] * modelInputs['dutyCycleDerateFactor']

    if (!_.isFinite(newApplianceLoad)) {
      throw new Error(
        `newApplianceLoad did not calculate properly. Check your file has all required columns and that all values are finite. Row: ${JSON.stringify(
          applianceRow
        )}. Also make sure modelInputs are numbers and not strings or undefined: ${JSON.stringify(
          modelInputs
        )}`
      )
    }

    /*
     * Now calculate new values based on the HOMER and usage profiles
     */
    // The energy content above what HOMER (or the user) decides is the minimum
    // Energy content the battery should have
    const energyContentAboveMin = batteryEnergyContent - effectiveMinBatteryEnergyContent

    // Find available capacity (kW) before the new appliance is added
    const availableCapacity =
      excessElecProd + (batterySOC <= minbatterySOC ? 0 : energyContentAboveMin)

    // Find available capacity after the new appliance is added
    const availableCapacityAfterNewLoad = availableCapacity - newApplianceLoad

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
      newApplianceLoad > excessElecProd ? newApplianceLoad - excessElecProd : 0

    // Original Battery Energy Content Delta
    // This is how much the energy content in the battery has increased or decreased in
    // the last hour. Takes into account the 2 column headers that are text, not real values
    const originalBatteryEnergyContentDelta =
      rowIndex <= headerRowCount ? 0 : batteryEnergyContent - prevBatteryEnergyContent

    // New Appliance Battery Energy Content:
    // The battery energy content under the scenario of adding a new appliance.
    // This requires us to look at the energy content of the battery from the previous hour,
    // which means we need to look at the previous row than the one we are iterating over.
    // This is why these values are being calculated in a reducing function instead of a map
    const prevNewApplianceBatteryEnergyContent =
      rowIndex <= headerRowCount ? 0 : prevResult['newApplianceBatteryEnergyContent']
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
      hour: row['hour'],
      datetime: row['Time'],
      hour_of_day: applianceRow['hour_of_day'],
      day: applianceRow['day'],
      day_hour: applianceRow['day_hour'],
      // kw_factor: applianceRow['kw_factor'],
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),
      prevBatterySOC: _.round(prevBatterySOC, 4),
      prevBatteryEnergyContent: _.round(prevBatteryEnergyContent, 4),
      newApplianceLoad: _.round(newApplianceLoad, 4),
      energyContentAboveMin: _.round(energyContentAboveMin, 4),
      availableCapacity: _.round(availableCapacity, 4),
      availableCapacityAfterNewLoad: _.round(availableCapacityAfterNewLoad, 4),
      // Unmet load counts are very sensitive to how many decimals you round to
      // Rounding to 3 decimals filters out loads less than 1 watthour
      // Rounding to 0 decimals filters out loads less than 1 kWh
      // Amanda decided to filter out anything less than 100 watthours (1 decimal)
      originalUnmetLoad: _.round(originalUnmetLoad, 1),
      additionalUnmetLoad: _.round(additionalUnmetLoad, 1),
      newTotalUnmetLoad: _.round(newTotalUnmetLoad, 1),
      newApplianceBatteryConsumption: _.round(newApplianceBatteryConsumption, 4),
      originalBatteryEnergyContentDelta: _.round(originalBatteryEnergyContentDelta, 4),
      newApplianceBatteryEnergyContent: _.round(newApplianceBatteryEnergyContent, 4),
    })
    return result
  }

  // Iterate over homer data, pushing each new row into an array
  return _.reduce(homer, columnReducer, [])
}

/**
 * Process files on import
 */
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

// Rename HOMER column names so we have consistent variables to do calculations with.
// If HOMER had Litium Ion batteries, all calculations would break. Example of changes:
// "Generic 1kWh Lead Acid [ASM] Energy Content" => "Battery Energy Content"
// "Generic flat plate PV Solar Altitude" => "PV Solar Altitude"
function renameHomerKeys(row, fileInfo) {
  const { battery, pvSystem } = fileInfo
  return _.mapKeys(row, (val, key) => {
    switch (true) {
      case _.includes(key, battery):
        return _.replace(key, battery, 'Battery')
      case _.includes(key, pvSystem):
        return _.replace(key, `${pvSystem} `, '')
      default:
        return key
    }
  })
}

// Convert output from raw CSV parse into something that React Virtualized
// can display
// Units come in as the first second row, header is the first but
export function processHomerFile(rows, fileInfo) {
  const renamedRows = _.map(rows, (row, rowIndex) => {
    return renameHomerKeys(row, fileInfo)
  })

  const headerRow = createHeaderRow(renamedRows)
  const modifiedTable = _.map(renamedRows, (row, rowIndex) => {
    // Pass the first row without modification, which is column's units after Papaparse is done,
    if (rowIndex === 0) {
      return row
    }
    return _.mapValues(row, (val, key) => {
      if (key === 'Time') {
        return DateTime.fromFormat(val, homerParseFormat).toISO()
      }
      return _.round(val, 5)
    })
  })
  const tableData = [headerRow].concat(modifiedTable)
  return addHourIndex(tableData)
}

export function processApplianceFile(rows, fileInfo) {
  const unitRow = {
    datetime: '-',
    hour: '-',
    day: '-',
    hour_of_day: '-',
    day_hour: '-',
    kw_factor: 'fullcapacity/kW',
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
  const modifiedTable = _.map(rows, row => {
    return {
      ...row,
      ...{
        // Convert all dates into ISO 8606 format. Format them for display elsewhere
        datetime: DateTime.fromFormat(row['datetime'], applianceParseFormat).toISO(),
        kw_factor: _.round(row['kw_factor'], 5),
        production_factor: _.round(row['production_factor'], 5),
      },
    }
  })
  return [createHeaderRow(rows), unitRow].concat(modifiedTable)
}

export function getHomerStats(homer) {
  const minBatteryEnergyContent = findColMin(homer, 'Battery Energy Content')
  const maxBatteryEnergyContent = findColMax(homer, 'Battery Energy Content')
  // Absolute minimum battery state of charge
  const minbatterySOC = findColMin(homer, 'Battery State of Charge')
  const maxbatterySOC = findColMax(homer, 'Battery State of Charge')

  // Effective Minimum Battery Energy Content
  // When creating a HOMER run, the user determines the minimum (suggested) percent that the
  // battery discharges. In theory, this determines the minimum energy content (kWh) of the
  // battery. But apparently there is a non-linear relationship with the charge percent (state
  // of charge) and the energy content.
  // HOMER starts out the year with a fully charged battery. It looks like HOMER only allows
  // the battery to get to the absolute minimum in the last few hours of the year. So the effective
  // minimum for most of the year is a little higher than that.

  // So to find the effective minimum energy content, first look up the absolute minimum state of
  // charge (minbatterySOC) and round up to the nearest integer.
  // Then go down, hour-by-hour, looking for the first hour we get near that point
  // (within a value of 1, which is 1%).
  const minbatterySOCRowId = _.findIndex(homer, row => {
    return (
      // Round up to nearest integer (ceil) of absolute min
      _.ceil(minbatterySOC) >=
      // Will be greater than rounding down to nearest integer of the current row
      _.floor(row['Battery State of Charge'])
    )
  })
  // If no row meets this condition, just take the absolute min as a fallback.
  // I'm assuming effective min will be within 1% of absolute min, otherwise take absolute
  // That may not be an assumption we want to make.
  // We need to understand HOMER's algorithms better
  const effectiveMinBatteryEnergyContent =
    minbatterySOCRowId > 0 ? homer[minbatterySOCRowId]['Battery Energy Content'] : minbatterySOC

  return {
    minBatteryEnergyContent,
    maxBatteryEnergyContent,
    effectiveMinBatteryEnergyContent,
    minbatterySOC,
    maxbatterySOC,
  }
}

export function getSummaryStats(calculatedColumns, modelInputs) {
  // Unmet Loads: Original without new appliance
  const originalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
    'hour_of_day',
    'originalUnmetLoad'
  )

  // Unmet Loads: Additional Appliance
  const additionalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadCountPercent = percentOfYear(additionalUnmetLoadCount)
  const additionalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
    'hour_of_day',
    'additionalUnmetLoad'
  )

  // Unmet Loads: Total with new appliance
  const newTotalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadCountPercent = percentOfYear(newTotalUnmetLoadCount)
  const newTotalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
    'hour_of_day',
    'newTotalUnmetLoad'
  )

  const allUnmetLoadHist = mergeArraysOfObjects(
    'hour_of_day',
    originalUnmetLoadHist,
    additionalUnmetLoadHist,
    newTotalUnmetLoadHist
  )

  // Yearly kWh and Financial Calculations
  // New Appliance kWh for the year
  const newApplianceYearlyKwh = sumGreaterThanZero(calculatedColumns, 'newApplianceLoad')

  // New Appliance kWh revenue for grid operator (cost for appliance owner)
  const newApplianceElectricityRevenue =
    newApplianceYearlyKwh * modelInputs['retailElectricityPrice']

  // Electricity cost to grid operator
  const newApplianceElectricityCost =
    newApplianceYearlyKwh * modelInputs['wholesaleElectricityCost']

  // Cost to grid operator of new appliance's unmet load
  const newApplianceUnmetLoadCost = additionalUnmetLoadSum * modelInputs['unmetLoadCostPerKwh']

  const newApplianceNetRevenue =
    newApplianceElectricityRevenue - newApplianceElectricityCost - newApplianceUnmetLoadCost

  // Calculate production of new appliance based on
  const yearlyProductionUnits = newApplianceYearlyKwh * modelInputs['productionUnitsPerKwh']
  const yearlyProductionUnitsRevenue =
    yearlyProductionUnits * modelInputs['revenuePerProductionUnits']
  const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newApplianceElectricityRevenue

  return {
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

    newApplianceYearlyKwh: _.round(newApplianceYearlyKwh),
    newApplianceElectricityRevenue: _.round(newApplianceElectricityRevenue),
    newApplianceElectricityCost: _.round(newApplianceElectricityCost),
    newApplianceUnmetLoadCost: _.round(newApplianceUnmetLoadCost),
    newApplianceNetRevenue: _.round(newApplianceNetRevenue),

    yearlyProductionUnits: yearlyProductionUnits,
    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    netApplianceOwnerRevenue: _.round(netApplianceOwnerRevenue),
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
        throw new Error(`File fetched does not have a known type: ${JSON.stringify(fileInfo)}`)
    }
  } catch (error) {
    console.error(
      `File load fail for : ${fileInfo.path}. Make sure appliance CSV has all headers.`,
      error
    )
  }
}
