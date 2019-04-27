import _ from 'lodash'

export const timeSegmentsMetrics = ['load', 'unmetLoad', 'excessProduction']
export const timeSegmentsAggregations = ['average', 'count', 'sum']
export const timeSegmentsBy = ['hourOfDay', 'dayOfWeek', 'month', 'dayHour']

export function calcTimeSegments(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }

  // const xProd = cartesianProductOf(timeSegmentsMetrics, timeSegmentsAggregations, timeSegmentsBy)
  // console.log('xProd: ', xProd)

  // TODO: To generate the name of the hist, join each item in the cartesian prod:
  // load_average_dayOfWeek
  // load_average_month
  // Need to switch hourOfDay to hourOfDay throughout app

  // Or do I calculate these on demand?
  // debugger

  // ___________________________________________________________________________
  // Group by time segment (for more efficient calculations)
  // ___________________________________________________________________________

  // originalUnmetLoad
  const originalUnmetLoadSum = _.sumBy(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadCount = countGreaterThanZero(combinedTable, 'originalUnmetLoad')

  const t0 = performance.now()
  const byHourOfDayGroup = _.groupBy(combinedTable, 'hourOfDay') // 2.2ms
  const t1 = performance.now()
  // const byDayOfWeekGroup = groupByDayOfWeek(combinedTable)
  // const originalUnmetLoadSumByHour = sumByHist(byHourOfDayGroup, 'originalUnmetLoad', 'hourOfDay')  // 3ms

  // const originalUnmetLoadAvgByHour = averageByHist(
  //   byHourOfDayGroup,
  //   'originalUnmetLoad',
  //   'hourOfDay'
  // ) // 5ms

  const originalUnmetLoadCountByHour = countByHist(
    byHourOfDayGroup,
    'originalUnmetLoad',
    'hourOfDay'
  ) // 16ms

  console.log('calc took: ', t1 - t0, 'ms')

  // ___________________________________________________________________________
  // Looped Calculations
  // ___________________________________________________________________________
  const groups = {
    hourOfDay: _.groupBy(combinedTable, 'hourOfDay'),
  }
  // const aggregations = {
  // }

  return {
    originalUnmetLoadSum,
    originalUnmetLoadCount,
    // originalUnmetLoadSumByHour: _.round(originalUnmetLoadSumByHour),
    // originalUnmetLoadAvgByHour,
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
