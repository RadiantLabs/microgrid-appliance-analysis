import _ from 'lodash'
import {
  // countGreaterThanZero,
  // mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
} from './helpers'

export function calcTimeSegments(combinedTable) {
  if (_.isEmpty(combinedTable)) {
    return {}
  }
  const originalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadAvgByHour = averageByHist(
    combinedTable,
    'originalUnmetLoad',
    'hour_of_day'
  )
  const originalUnmetLoadCountByHour = countByHist(
    combinedTable,
    'originalUnmetLoad',
    'hour_of_day'
  )

  console.log('originalUnmetLoadAvgByHour: ', originalUnmetLoadAvgByHour)
  return {
    originalUnmetLoadSum,
    originalUnmetLoadAvgByHour,
  }
}

function averageByHist(table, valKey, byKey) {
  const groupedByKey = _.groupBy(table, byKey)
  return _.map(groupedByKey, (val, key) => {
    const avg = _.round(_.sumBy(val, valKey) / _.size(val), 4)
    return {
      [byKey]: key,
      [valKey]: _.round(avg, 4),
    }
  })
}

function countByHist(table, valKey, byKey) {
  const groupedByKey = _.groupBy(table, byKey)
  const avgByKey = _.reduce(
    groupedByKey,
    (result, val, key) => {
      const avg = _.sumBy(val, valKey) / _.size(val)
      result[key] = avg
      return result
    },
    {}
  )
  return avgByKey
}

// const avgByKey = _.reduce(
//   groupedByKey,
//   (result, val, key) => {
//     const avg = _.round(_.sumBy(val, valKey) / _.size(val), 4)
//     result[key] = avg
//     return result
//   },
//   {}
// )
