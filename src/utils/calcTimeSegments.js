import _ from 'lodash'
// import { logger } from './logger'

export const timeSegmentsMetrics = ['load', 'unmetLoad', 'excessProduction']
export const timeSegmentsAggregations = ['average', 'sum', 'count']
export const timeSegmentsBy = ['hourOfDay', 'dayOfWeek', 'month', 'hourOfWeek']

export const originalsColumns = {
  load: ['originalElectricLoadServed'],
  unmetLoad: ['originalModeledUnmetLoad'],
  excessProduction: ['originalModeledExcessProduction'],
}

export const newLoadsColumns = {
  load: ['newAppliancesLoad', 'newAppliancesAncillaryLoad'],
  unmetLoad: ['newAppliancesUnmetLoad'],
  excessProduction: ['newAppliancesExcessProduction'],
}

export const totalsColumn = {
  load: ['totalElectricalLoadServed'],
  unmetLoad: ['totalUnmetLoad'],
  excessProduction: ['totalExcessProduction'],
}

function concatValues(objValue, srcValue) {
  return _.isArray(objValue) ? objValue.concat(srcValue) : null
}

export const chartedColumns = _.mergeWith(originalsColumns, newLoadsColumns, concatValues)

const allMetricColumns = _.flatten(
  _.concat(_.values(originalsColumns), _.values(newLoadsColumns), _.values(totalsColumn))
)

// This is used for counting how many times per year we have a value for the load,
// unmet load or excess production. So for example, how many times per year (at a given
// hour of day or day of week) do we have unmet load? If we already have an unmet load
// from the original HOMER grid, we don't want to add another count of unmet load
// due to appliances. The generator has already turned on so we don't want to count again.
// Note: This does not include the load from ancillary equipment, which would probably
// be negiligible but may want to include it at some point.
const countPairs = {
  newAppliancesLoad: 'originalElectricLoadServed',
  newAppliancesUnmetLoad: 'originalModeledUnmetLoad',
  newAppliancesExcessProduction: 'originalModeledExcessProduction',
}

// Calculate histogram data for all time segment.
// Put all metrics we will use in a single histogram structure
// total: 486ms
// Naming scheme:
// average_hourOfWeek_hist
// average_dayOfWeek_hist
// count_month_hist
// sum_hourOfWeek_hist
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
      [`count_${by}_hist`, countByHist(groups[by], allMetricColumns, by, countPairs)],
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
    hourOfWeek: _.groupBy(combinedTable, 'hourOfWeek'),
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

function countByHist(group, columns, byKey, countPairs, precision = 1) {
  return _.map(group, (rows, key) => {
    const columnSumPairs = _.map(columns, column => {
      const rowsGreaterThanZero = _.filter(rows, row => {
        // Does it already have a count from it's pair? For example, for newAppliancesLoad, is
        // originalElectricLoadServed already counted? If so, don't count it twice
        if (_.has(countPairs, column)) {
          return originalWillHaveCount(row, column, countPairs[column], precision)
        }
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

function originalWillHaveCount(row, newAppliances, original, precision) {
  const originalVal = _.round(row[original], precision)
  const newAppliancesVal = _.round(row[newAppliances], precision)
  return originalVal > 0 ? false : newAppliancesVal > 0
}
