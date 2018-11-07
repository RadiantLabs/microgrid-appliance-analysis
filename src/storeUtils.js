import _ from 'lodash'

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
        return { ...row, ...{ Hour: 'Hour' } }
      case -1:
        return { ...row, ...{ Hour: null } }
      default:
        return { ...row, ...{ Hour: hour } }
    }
  })
}

// Sort keys manually (key order in objects is never deterministic) so I can put
// columns I want as fixed columns
export function setKeyOrder(rows) {
  const frontItems = ['Hour']
  const keys = _.keys(rows[0])
  return frontItems.concat(_.without(keys, ...frontItems))
}

// TODO: Parse date and reformat
export function processHomerFile(rows) {
  const headerRow = createHeaderRow(rows)
  const tableData = [headerRow].concat(rows)
  const addedHour = addHourIndex(tableData)

  const keyOrder = setKeyOrder(addedHour)
  return { tableData: addedHour, keyOrder }
}
