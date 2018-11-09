import _ from 'lodash'

// import { toJS } from 'mobx'

/**
 * These are more general purpose utility functions, not directly related to the store
 */

// Non-mutating array insert
export const arrayInsert = (arr, item, index) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}

export const filterNums = (table, key) => {
  return _.filter(_.map(table, key), _.isNumber)
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
export function setKeyOrder(rows) {
  const frontItems = ['hour']
  const keys = _.keys(rows[0])
  return frontItems.concat(_.without(keys, ...frontItems))
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
  const table2Headers = _.take(table2, headerCount)
  const table2Data = _.drop(table2, headerCount)
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
