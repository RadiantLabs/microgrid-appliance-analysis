import _ from 'lodash'

export function calcReferenceLineFlexible(data, actual, predicted) {
  if (_.isEmpty(data) || !actual || !predicted) {
    return []
  }
  const chartMin = _.minBy(data, predicted)[predicted]
  const chartMax = _.maxBy(data, predicted)[predicted]
  const range = _.range(_.floor(chartMin), _.ceil(chartMax))
  return _.map(range, val => {
    return { [actual]: val, [predicted]: val }
  })
}
