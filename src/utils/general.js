import _ from 'lodash'
import { HOURS_PER_YEAR } from './constants'
import { toJS } from 'mobx'

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

export const createGreaterThanZeroHistogram = (
  table,
  byKey,
  countKey,
  byKeyIsInteger = true
) => {
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

// Sort keys manually (key order in objects is never deterministic) so I can put
// columns I want as fixed columns
// TODO: make this more generalizable
export function setKeyOrder(rows) {
  const frontItems = ['hour']
  const keys = _.keys(rows[0])
  return frontItems.concat(_.without(keys, ...frontItems))
}

// TODO: rewrite to allow passing in more than 2 arrays
export function mergeArraysOfObjects(joinKey, arr1, arr2) {
  return _(arr1)
    .concat(arr2) // Can list multiple arrays to concat here, including calculated columns
    .groupBy(joinKey)
    .map(_.spread(_.merge))
    .value()
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

  // TODO: Trying to fix this error: [mobx] Computed values are not allowed to cause side effects by changing observables that are already being observed
  // Recreated by changing some combination of usage factor to kW and the appliance or homer file
  const table1Headers = _.take(toJS(table1), headerCount)
  const table1Data = _.drop(table1, headerCount)
  const table2Headers = _.take(toJS(table2), headerCount)
  const table2Data = _.drop(table2, headerCount)

  // TODO: call into the mergeArraysOfObjects function above
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

// This function isn't  used yet - it will be expanded and generalized
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
