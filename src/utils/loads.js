export function calcNewAvailCapacity(table) {}

/**
 * Pass in the merged table that includes Homer and Usage factors
 * Also pass in adjustable fields from store and constants that are required
 * to do the calculations
 * @param {*} table
 * @param {*} fields
 * @param {*} tableStats
 * @param {*} constants
 */
export function calculateNewLoads({ table, fields, tableStats, constants }) {
  console.log('tableStats: ', tableStats)
  const newAvailCapacity = calcNewAvailCapacity(table, tableStats)
  return { tableData: null, keyOrder: null }
}
