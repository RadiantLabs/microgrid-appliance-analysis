import _ from 'lodash'
import { DateTime } from 'luxon'
import path from 'path-browserify'
import moment from 'moment'
import { HOURS_PER_YEAR, tableDateFormat, applianceParseFormat } from './constants'
import { logger } from './logger'

export const momentApplianceParseFormats = ['YYYY-MM-DD hh:mm:ss']
export const csvOptions = {
  header: true,
  delimiter: ',',
  dynamicTyping: true,
  skipEmptyLines: true,
  comments: 'sep=',
}

// -----------------------------------------------------------------------------
// These are more general purpose utility functions, not directly related to the store
//------------------------------------------------------------------------------
export function isFileCsv(fileType) {
  return fileType === 'text/csv'
}

// Just check a sample of column headers to make sure they are strings.
// But since this is coming in from a CSV, we need to make sure they aren't
// numbers wrapped in quotes, like '5'.
export function hasColumnHeaders(headers) {
  const header4 = parseFloat(headers[3])
  const header5 = parseFloat(headers[4])
  return !_.isFinite(header4) && !_.isFinite(header5)
}

export function lastSavedTimeAgo(appIsSavedTimestamp) {
  const mDate = moment(appIsSavedTimestamp)
  return mDate.isValid() ? `Last Saved: ${mDate.fromNow()}` : 'No found versions'
}

// Add a column to table that autoincrements based on row index
export function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    return { ...row, ...{ hour: rowIndex } }
  })
}

export function getMonth(datetime) {
  return parseInt(moment(datetime).format('M'), 10)
}

// Where credit is due: https://stackoverflow.com/a/14053282/1884101
export function stripDuplicateWhitespace(str) {
  return String(str).replace(/\s{2,}/g, ' ')
}

export function booleanDisplay(item) {
  switch (true) {
    case _.isNull(item):
      return ''
    case item === true:
      return 'Yes'
    case item === false:
      return 'No'
    default:
      return ''
  }
}

export function calculateRoi(netIncome, capex) {
  return (100 * netIncome) / capex
}

export function calculatePayback(netIncome, capex) {
  // return netIncome > 0 ? capex / netIncome : Infinity
  return capex / netIncome
}

export function calcAvgError(table, key) {
  if (_.isEmpty(table)) {
    return null
  }
  const dataSize = _.size(table)
  const sum = _.sumBy(table, key)
  return dataSize === 0 ? Infinity : _.round((sum * 100) / dataSize, 2)
}

export function calcMaxError(table, key) {
  if (_.isEmpty(table)) {
    return null
  }
  return _.round(_.maxBy(table, key)[key] * 100, 2)
}

// Non-mutating array insert
export const arrayInsert = (arr, item, index) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}

export const checkKey = (table, key) => {
  if (!_.has(_.first(table), key)) {
    logger(`Can't find key: ${key}: Check calling function`)
  }
}

export const getIsoTimestamp = () => {
  return DateTime.local().toISO()
}

export function parseHomerDateFormats(val) {
  switch (true) {
    // 1/1/07 0:00 am
    case _.includes(val, 'am') || _.includes(val, 'pm'):
      return moment(val, 'M/D/YYYY H:mm a').format()

    // 1/1/07 0:00 AM
    case _.includes(val, 'AM') || _.includes(val, 'PM'):
      return moment(val, 'M/D/YYYY H:mm A').format()
    default:
      // 1/1/07 0:00  (notice this has a 2 digit year)
      return moment(val, 'M/D/YY H:mm').format()
  }
}
// window.parseHomerDateFormats = parseHomerDateFormats

export const removeFileExtension = fileName => {
  return path.parse(fileName).name
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

// function originalWillHaveCount(row, newAppliances, original, precision) {
//   const originalVal = _.round(row[original], precision)
//   const newAppliancesVal = _.round(row[newAppliances], precision)
//   return originalVal > 0 ? false : newAppliancesVal > 0
// }

// export const countGreaterThanZero = (table, column, countPairs, precision = 1) => {
//   const rowsGreaterThanZero = _.filter(table, row => {
//     // Does it already have a count from it's pair? For example, for newAppliancesLoad, is
//     // originalElectricLoadServed already counted? If so, don't count it twice
//     if (_.has(countPairs, column)) {
//       const abc = originalWillHaveCount(row, column, countPairs[column], precision)
//       console.log('abc: ', abc)
//       return abc
//     }
//     // debugger
//     return _.round(row[column], precision) > 0
//   })
//   console.log('count: ', _.size(rowsGreaterThanZero))
//   return rowsGreaterThanZero
// }

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

// https://gist.github.com/ijy/6094414#gistcomment-2651944
// function cartesianProductOf(...arrays) {
//   return arrays.reduce((a, b) => _.flatten(a.map(x => b.map(y => x.concat([y])))), [[]])
// }

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

export const formatApplianceDateForTable = val => {
  const dateObj = DateTime.fromFormat(val, applianceParseFormat)
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

export const findColAverage = (table, key) => {
  const size = _.size(table)
  return size === 0 ? Infinity : _.sumBy(table, key) / size
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

export function combineTables(gridData, hybridColumns, applianceData) {
  if (_.isEmpty(gridData) || _.isEmpty(hybridColumns) || _.isEmpty(applianceData)) {
    return []
  }
  return mergeArraysOfObjects('hour', gridData, hybridColumns, applianceData)
}

// -----------------------------------------------------------------------------
// Domain specific helper functions
//------------------------------------------------------------------------------
