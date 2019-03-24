import _ from 'lodash'

export function calcPredictedVsActual(fileData) {
  if (_.isEmpty(fileData)) {
    return []
  }
  return _.map(fileData, row => {
    const prediction = row['originalModeledBatteryEnergyContent']
    const actual = row['originalBatteryEnergyContent']
    return {
      actual: _.round(actual, 2),
      predicted: _.round(prediction, 2),
      error: Math.abs((prediction - actual) / actual),
    }
  })
}

export function calcReferenceLine(chartMin, chartMax) {
  if (!chartMin || !chartMax) {
    return []
  }
  const range = _.range(_.floor(chartMin), _.ceil(chartMax))
  return _.map(range, val => {
    return { actual: val, predicted: val }
  })
}
