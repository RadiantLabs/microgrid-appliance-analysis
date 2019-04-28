import _ from 'lodash'
import { logger } from './logger'

export const timeSegmentsMetrics = ['load', 'unmetLoad', 'excessProduction']
export const timeSegmentsAggregations = ['average', 'count', 'sum']
export const timeSegmentsBy = ['hourOfDay', 'dayOfWeek', 'month', 'dayHour']

// We will only chart the original [0] and new appliances [1] metric.
// The total [2] will be used in the tool tip
export const columnsToCalculate = {
  load: ['Original Electrical Load Served', 'newAppliancesLoad'],
  unmetLoad: ['originalUnmetLoad', 'newAppliancesUnmetLoad'],
  excessProduction: ['originalExcessProduction', 'newAppliancesExcessProduction'],
}

export const totalColumnsByMetric = {
  load: ['totalElectricalLoadServed'],
  unmetLoad: ['totalUnmetLoad'],
  excessProduction: ['totalExcessProduction'],
}

const allMetricColumns = [
  ..._.flatMap(columnsToCalculate, _.values),
  ..._.flatMap(totalColumnsByMetric, _.values),
]

// ___________________________________________________________________________
// Group by time segment (for more efficient calculations)
// ___________________________________________________________________________
export function calcTimeSegmentGroups(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }
  console.log('calculating calcTimeSegmentGroups')
  return {
    hourOfDay: _.groupBy(combinedTable, 'hourOfDay'),
    dayOfWeek: _.groupBy(combinedTable, 'dayOfWeek'),
    month: _.groupBy(combinedTable, 'month'),
    dayHour: _.groupBy(combinedTable, 'dayHour'),
  }
}

// Calculate histogram data for a given time segment.
// Put all metrics we will use in a single histogram structure
// total: 120ms
export function calcTimeSegments(metric, aggregation, by, groups) {
  if (_.isEmpty(groups) || !metric || !aggregation || !by) {
    return {}
  }
  console.log('calculating calcTimeSegments')
  return {
    averageHist: averageByHist(groups[by], allMetricColumns, by), // 12ms
    sumHist: sumByHist(groups[by], allMetricColumns, by), // 11ms
    countHist: countByHist(groups[by], allMetricColumns, by), // 89ms
  }
}

// _____________________________________________________________________________
// Histogram Functions
// _____________________________________________________________________________
function averageByHist(group, columns, byKey) {
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
