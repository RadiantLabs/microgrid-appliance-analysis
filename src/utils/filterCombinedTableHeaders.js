import _ from 'lodash'

// These are the table headers to show in the data grid. Show only if:
// 1. The user has not excluded it (saved in localforage)
// 2. It actually came in with the original HOMER file. For example, some HOMER
// files won't have a 'Capacity Shortage' header, so don't show it in the grid
export function filterCombinedTableHeaders(
  combinedTable,
  excludedTableColumns,
  combinedColumnHeaderOrder
) {
  if (_.isEmpty(combinedTable)) {
    return []
  }
  const combinedTableColumns = _.keys(_.first(combinedTable))
  return _.filter(combinedColumnHeaderOrder, header => {
    return !_.includes(excludedTableColumns, header) && _.includes(combinedTableColumns, header)
  })
}
