import _ from 'lodash'
// import { logger } from './logger'

export const timeSegmentsMetrics = ['load', 'unmetLoad', 'excessProduction']
export const timeSegmentsAggregations = ['average', 'sum', 'count']
export const timeSegmentsBy = ['hourOfDay', 'dayOfWeek', 'month', 'dayHour']

// We will only chart the original [0] and new appliances [1] metric.
// The total [2] will be used in the tool tip
export const columnsToCalculate = {
  load: ['Original Electrical Load Served', 'newAppliancesLoad', 'totalElectricalLoadServed'],
  unmetLoad: ['originalUnmetLoad', 'newAppliancesUnmetLoad', 'totalUnmetLoad'],
  excessProduction: [
    'originalExcessProduction',
    'newAppliancesExcessProduction',
    'totalExcessProduction',
  ],
}

const allMetricColumns = _.flatMap(columnsToCalculate, _.values)

// Calculate histogram data for all time segment.
// Put all metrics we will use in a single histogram structure
// total: 486ms
// Naming scheme:
// average_dayHour_hist
// average_dayOfWeek_hist
// count_month_hist
// sum_dayHour_hist
export function calcTimeSegments(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }
  console.log('calculating calcTimeSegments')
  const groups = calcTimeSegmentGroups(combinedTable)
  const byTimePairs = _.flatMap(timeSegmentsBy, by => {
    return [
      [`average_${by}_hist`, averageByHist(groups[by], allMetricColumns, by)],
      [`sum_${by}_hist`, sumByHist(groups[by], allMetricColumns, by)],
      [`count_${by}_hist`, countByHist(groups[by], allMetricColumns, by)],
    ]
  })
  return _.fromPairs(byTimePairs)
}

// ___________________________________________________________________________
// Group by time segment (for more efficient calculations)
// ___________________________________________________________________________
function calcTimeSegmentGroups(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }
  return {
    hourOfDay: _.groupBy(combinedTable, 'hourOfDay'),
    dayOfWeek: _.groupBy(combinedTable, 'dayOfWeek'),
    month: _.groupBy(combinedTable, 'month'),
    dayHour: _.groupBy(combinedTable, 'dayHour'),
  }
}

// _____________________________________________________________________________
// Histogram Functions
// _____________________________________________________________________________
function averageByHist(group, columns, byKey) {
  // console.log('__ byKey: ', byKey, '__________')
  // console.log('group: ', group)
  // console.log('columns: ', columns)
  return _.map(group, (rows, key) => {
    const columnAvgPairs = _.map(columns, column => {
      return [column, _.round(_.sumBy(rows, column) / _.size(rows), 2)]
    })
    return {
      [byKey]: parseInt(key, 10),
      ..._.fromPairs(columnAvgPairs),
    }
  })
}

function sumByHist(group, columns, byKey) {
  return _.map(group, (rows, key) => {
    const columnSumPairs = _.map(columns, column => {
      return [column, _.round(_.sumBy(rows, column))]
    })
    return {
      [byKey]: parseInt(key, 10),
      ..._.fromPairs(columnSumPairs),
    }
  })
}

function countByHist(group, columns, byKey, precision = 1) {
  return _.map(group, (rows, key) => {
    const columnSumPairs = _.map(columns, column => {
      const rowsGreaterThanZero = _.filter(rows, row => {
        return _.round(row[column], precision) > 0
      })
      return [column, _.size(rowsGreaterThanZero)]
    })
    return {
      [byKey]: parseInt(key, 10),
      ..._.fromPairs(columnSumPairs),
    }
  })
}
