import _ from 'lodash'

export function calcPredictedVsActual(hybridColumns) {
  if (_.isEmpty(hybridColumns)) {
    return []
  }
  return _.map(hybridColumns, row => {
    const prediction = row['tempBatteryEnergyContent']
    const actual = row['originalBatteryEnergyContent']
    return {
      actual: _.round(actual, 2),
      predicted: _.round(prediction, 2),
      error: Math.abs((prediction - actual) / actual),
    }
  })
}
