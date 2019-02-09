import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import {
  HOURS_PER_YEAR,
  homerParseFormat,
  applianceParseFormat,
  tableDateFormat,
} from './constants'
import Papa from 'papaparse'
export const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }
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
// Clone the primary array because somewhere this mutates, which throws errors in Mobx
export function mergeArraysOfObjects(joinKey, arr1, ...arrays) {
  return _(_.cloneDeep(arr1))
    .concat(...arrays) // Can list multiple arrays to concat here
    .groupBy(joinKey)
    .map(_.spread(_.merge))
    .value()
}

export function combineTables(activeHomer, calculatedColumns, activeAppliance) {
  if (_.isEmpty(activeHomer) || _.isEmpty(calculatedColumns) || _.isEmpty(activeAppliance)) {
    return []
  }
  const t0 = performance.now()
  const combinedTable = calculatedColumns
    ? mergeArraysOfObjects('hour', activeHomer, calculatedColumns, activeAppliance)
    : []
  const t1 = performance.now()
  console.log('combinedTable took ' + _.round(t1 - t0) + ' milliseconds.')
  return combinedTable
}

/**
 * Process files on import
 */
function isFileCsv(rawFile) {
  return rawFile.type === 'text/csv'
}
function hasColumnHeaders(headers) {
  const header4 = parseFloat(headers[3])
  const header5 = parseFloat(headers[3])
  return _.isFinite(header4) && _.isFinite(header5)
}
function getGridPowerType(headers) {
  const hasDC = _.some(headers, header => _.includes(header, 'DC Primary Load'))
  const hasAC = _.some(headers, header => _.includes(header, 'AC Primary Load'))
  if (hasDC && hasAC) {
    // TODO: log errors for monitoring
  }
  return {
    powerType: hasDC ? 'DC' : 'AC',
    powerTypeErrors:
      hasDC && hasAC
        ? "This grid appears to have both AC and DC power types, which we don't currently support. Please contact support."
        : null,
  }
}

export function verifyHomerFile(rawFile, parsedFile) {
  let errors = []
  const { size, name } = rawFile
  const fileIsCsv = isFileCsv(rawFile)
  const headers = _.keys(_.first(parsedFile.data))
  if (!hasColumnHeaders(headers)) {
    errors.push(
      `This file appears to not have column header descriptions. The first row of the HOMER file should contain the column name and the second row contain the column units.`
    )
  }
  if (!fileIsCsv) {
    errors.push(`File is not a CSV. If you have an Excel file, export as CSV.`)
  }
  // 5MB limit
  if (size > 1048576 * 5) {
    errors.push(`Filesize too big. Your file is ${prettyBytes(size)}`)
  }
  const { powerType, powerTypeErrors } = getGridPowerType(headers)
  errors.push(powerTypeErrors)
  const { data } = parsedFile
  return {
    fileName: String(name).split('.')[0],
    fileSize: size,
    fileIsCsv: fileIsCsv,
    fileData: data,
    fileErrors: _.compact(errors),
    fileWarnings: parsedFile.errors,
    filePowertype: powerType,
  }
}

// Add a column to table that autoincrements based on row index
function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    return { ...row, ...{ hour: rowIndex } }
  })
}

// Rename HOMER column names so we have consistent variables to do calculations with.
// If HOMER had Litium Ion batteries, all calculations would break. Example of changes:
// "Generic 1kWh Lead Acid [ASM] Energy Content" => "Battery Energy Content"
// "Generic flat plate PV Solar Altitude" => "PV Solar Altitude"
function renameHomerKeys(row, fileInfo) {
  const { battery, pvSystem } = fileInfo.attributes
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

// Convert output from raw CSV parse into something that React Virtualized can display
// Drop the first after parsing which is the units row.
export function processHomerFile(rows, fileInfo) {
  const renamedRows = _.map(_.drop(rows, 1), (row, rowIndex) => {
    return renameHomerKeys(row, fileInfo)
  })
  const modifiedTable = _.map(renamedRows, (row, rowIndex) => {
    return _.mapValues(row, (val, key) => {
      if (key === 'Time') {
        return DateTime.fromFormat(val, homerParseFormat).toISO()
      }
      return _.round(val, 5)
    })
  })
  return addHourIndex(modifiedTable)
}

export function processApplianceFile(rows, fileInfo) {
  return _.map(rows, row => {
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
}

export function filePathLookup(fileName, fileType, urlLocation) {
  const levelsDeep = urlLocation.pathname.split('/').length
  const relativePathCount = _.repeat('../', levelsDeep - 1)
  switch (fileType) {
    case 'homer':
      return relativePathCount + 'data/homer/' + fileName + '.csv'
    case 'appliance':
      return relativePathCount + 'data/appliances/' + fileName + '.csv'
    default:
      throw new Error(`Need to pase fileType (homer, appliance) to filePathLookup`)
  }
}

/**
 * Fetch Homer or Usage profile files.
 * @param {*} fileInfo
 */
export async function fetchFile(fileInfo, urlLocation) {
  if (_.isEmpty(fileInfo)) {
    throw new Error(`fileInfo not found in fetchFile`)
  }
  const { fileName, type } = fileInfo
  const filePath = filePathLookup(fileName, type, urlLocation)
  try {
    const res = await window.fetch(filePath)
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
      `File load fail for : ${filePath}. Make sure appliance CSV has all headers.`,
      error
    )
  }
}
