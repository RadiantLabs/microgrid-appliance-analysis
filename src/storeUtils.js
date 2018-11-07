import _ from 'lodash'

// Return an object with the values the same as the key.
// This let's React Virtualized Grid component render the top row with the name
// of the column
// Can use any row, picking the 3rd in case the second row is units
export function createHeaderRow(rows) {
  const thirdRow = rows[2]
  return _.mapValues(thirdRow, (val, key) => key)
}

// TODO:
// Probably want to shift this by 2 (as an argument so it's reusable) so we can
// account for the header rows
export function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    console.log('rowIndex: ', rowIndex)
    debugger
  })
}

// TODO: Create a single computed function that takes a raw HOMER file
// and processes it doing these things:
// * Add header row
// * Add hour index (add to front of keyOrder)
// * Parse date and reformat
export function processHomerFile(rows) {
  const keyOrder = _.keys(rows[0])
  const headerRow = createHeaderRow(rows)
  const tableData = [headerRow].concat(rows)
  return { tableData, keyOrder }
}
