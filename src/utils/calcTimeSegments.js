import _ from 'lodash'

export function calcTimeSegments(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }

  const metrics = ['load', 'unmetLoad', 'excessProduction']

  const aggregations = [
    'average', //
    'count', //
    'sum', //
  ]

  const byTime = [
    'hour_of_day', // TODO: rename this at the appliance level
    // 'hourOfDay', //
    'dayOfWeek',
    'month',
    'dayHour',
  ]

  const xProd = cartesianProductOf(metrics, aggregations, byTime)
  console.log('xProd: ', xProd)
  debugger

  // ___________________________________________________________________________
  // Group by time segment (for more efficient calculations)
  // ___________________________________________________________________________
  const byHourOfDayGroup = _.groupBy(combinedTable, 'hour_of_day')
  // const byDayOfWeekGroup = groupByDayOfWeek(combinedTable)

  // originalUnmetLoad
  const originalUnmetLoadSum = _.sumBy(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadCount = countGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadSumByHour = sumByHist(byHourOfDayGroup, 'originalUnmetLoad', 'hour_of_day')
  const originalUnmetLoadAvgByHour = averageByHist(
    byHourOfDayGroup,
    'originalUnmetLoad',
    'hour_of_day'
  )
  const originalUnmetLoadCountByHour = countByHist(
    byHourOfDayGroup,
    'originalUnmetLoad',
    'hour_of_day'
  )
  console.log('originalUnmetLoadAvgByHour: ', originalUnmetLoadAvgByHour)
  console.log('originalUnmetLoadCountByHour: ', originalUnmetLoadCountByHour)

  // ___________________________________________________________________________
  // Looped Calculations
  // ___________________________________________________________________________
  const groups = {
    hour_of_day: _.groupBy(combinedTable, 'hour_of_day'),
  }
  // const aggregations = {
  // }

  return {
    originalUnmetLoadSum,
    originalUnmetLoadCount,
    originalUnmetLoadSumByHour: _.round(originalUnmetLoadSumByHour),
    originalUnmetLoadAvgByHour,
    originalUnmetLoadCountByHour,
  }
}

// _____________________________________________________________________________
// Group By Functions
// _____________________________________________________________________________
function groupByDayOfWeek(table) {
  const abc = _.groupBy(table, row => {
    // console.log('row: ', row)
    // debugger
  })
  return abc
}

// _____________________________________________________________________________
// Misc
// _____________________________________________________________________________

function countGreaterThanZero(table, valKey, precision = 1) {
  const rowsGreaterThanZero = _.filter(table, row => {
    return _.round(row[valKey], precision) > 0
  })
  return _.size(rowsGreaterThanZero)
}

// https://gist.github.com/ijy/6094414#gistcomment-2651944
function cartesianProductOf(...arrays) {
  return arrays.reduce((a, b) => _.flatten(a.map(x => b.map(y => x.concat([y])))), [[]])
}

// _____________________________________________________________________________
// Histogram Functions
// _____________________________________________________________________________
function averageByHist(group, valKey, byKey) {
  return _.map(group, (rows, key) => {
    const avg = _.sumBy(rows, valKey) / _.size(rows)
    return {
      [byKey]: key,
      [valKey]: _.round(avg, 4),
    }
  })
}

function countByHist(group, valKey, byKey, precision = 1) {
  return _.map(group, (rows, key) => {
    const rowsGreaterThanZero = _.filter(rows, row => {
      return _.round(row[valKey], precision) > 0
    })
    return {
      [byKey]: key,
      [valKey]: _.size(rowsGreaterThanZero),
    }
  })
}

function sumByHist(table, valKey, byKey) {
  const groupedByKey = _.groupBy(table, byKey)
  return _.map(groupedByKey, (val, key) => {
    const sum = _.sumBy(val, valKey)
    return {
      [byKey]: key,
      [valKey]: _.round(sum),
    }
  })
}
