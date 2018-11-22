import _ from 'lodash'
import { HOURS_PER_YEAR } from './constants'
// import { toJS } from 'mobx'

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

// This isn't used yet
// export const remapKeyInArrayOfObjects = (table, oldKey, newKey) => {
//   return _.map(table, row => {
//     return _.mapKeys(row, (val, key) => (key === oldKey ? newKey : key))
//   })
// }

// Sort keys manually (key order in objects is never deterministic) so I can put
// columns I want as fixed columns
// TODO: make this more generalizable
export function setKeyOrder(rows) {
  const frontItems = ['hour']
  const keys = _.keys(rows[0])
  return frontItems.concat(_.without(keys, ...frontItems))
}

// This is lodash approach is ~100x faster than doing a iterating over
// arrays and merging row objects together with spread operator.
// This runs ~300ms the first time, ~100ms subsequent times.
// The other version took ~18 seconds
// You could rewrite this function to allow passing in more than 2 arrays
export function mergeArraysOfObjects(joinKey, arr1, ...arrays) {
  return _(arr1)
    .concat(...arrays) // Can list multiple arrays to concat here
    .groupBy(joinKey)
    .map(_.spread(_.merge))
    .value()
}

// export function mergeTables(table1, table2, headerCount = 2, joinKey = 'hour') {
//   if (_.isEmpty(table1) || !_.isArray(table1) || _.isEmpty(table2) || !_.isArray(table2)) {
//     return null
//   }
//   checkKey(table1, joinKey)
//   checkKey(table2, joinKey)

//   const table1Headers = _.take(table1, headerCount)
//   const table1Data = _.drop(table1, headerCount)
//   const table2Headers = _.take(table2, headerCount)
//   const table2Data = _.drop(table2, headerCount)
//   const mergedTable = mergeArraysOfObjects(joinKey, table1Data, table2Data)
//   const headerTitles = { ...table1Headers[0], ...table2Headers[0] }
//   const headerUnits = { ...table1Headers[1], ...table2Headers[1] }
//   return {
//     tableData: [headerTitles, headerUnits].concat(mergedTable),
//     keyOrder: setKeyOrder(mergedTable),
//   }
// }

// This function isn't  used yet - it will be expanded and generalized
// export function addColumns(table, headerTitle, headerUnit) {
//   const withColumn = _.map(table.tableData, (row, index) => {
//     switch (index) {
//       case 0:
//         return { ...row, ...{ [headerTitle]: headerTitle } }
//       case 1:
//         return { ...row, ...{ [headerTitle]: headerUnit } }
//       default:
//         return { ...row, ...{ [headerTitle]: 5 } }
//     }
//   })
//   return {
//     tableData: withColumn,
//     keyOrder: arrayInsert(table.keyOrder, headerTitle, 1),
//   }
// }
