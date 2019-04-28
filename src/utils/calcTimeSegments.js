import _ from 'lodash'
import { logger } from './logger'

export const timeSegmentsMetrics = ['load', 'unmetLoad', 'excessProduction']
export const timeSegmentsAggregations = ['average', 'count', 'sum']
export const timeSegmentsBy = ['hourOfDay', 'dayOfWeek', 'month', 'dayHour']

// TODO: where is originalLoad? I should create this variable when parsing
const columnsToCalculate = {
  load: ['TODO', 'newAppliancesLoad', 'totalElectricalLoadServed'],
  unmetLoad: ['originalUnmetLoad', 'newAppliancesUnmetLoad', 'totalUnmetLoad'],
  excessProduction: [
    'originalExcessProduction',
    'newAppliancesExcessProduction',
    'totalExcessProduction',
  ],
}

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

export function calcTimeSegments(metric, aggregation, by, groups) {
  if (_.isEmpty(groups) || !metric || !aggregation || !by) {
    return {}
  }
  console.log('groups: ', groups)
  const abc = dispatcher(metric, aggregation, by, groups)
  // debugger
  return abc
}

function dispatcher(metric, aggregation, by, groups) {
  switch (aggregation) {
    case 'average':
      // TODO: 'load' only specifies one of several variables in the table
      // I need a lookup from load to originalUnmetLoad and additionalUnmetLoad
      return averageByHist(groups[by], metric, by)
    case 'count':
      return countByHist(groups[by], metric, by)
    case 'sum':
      return sumByHist(groups[by], metric, by)
    default:
      logger(
        `Could not find a histogram function. metric: ${metric}, aggregation: ${aggregation}, by: ${by}`
      )
  }
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

function sumByHist(group, valKey, byKey) {
  return _.map(group, (val, key) => {
    const sum = _.sumBy(val, valKey)
    return {
      [byKey]: key,
      [valKey]: _.round(sum),
    }
  })
}
