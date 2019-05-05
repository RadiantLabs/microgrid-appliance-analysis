import _ from 'lodash'
import MLR from 'ml-regression-multivariate-linear'

/*
Using: https://github.com/mljs/regression-multivariate-linear#usage

Create feature tensor:
x = [[prevBatteryEnergyContent0, electricalProductionLoadDiff0]
     [prevBatteryEnergyContent1, electricalProductionLoadDiff1]
     ...
     [prevBatteryEnergyContent8759, electricalProductionLoadDiff8759]]

Create target tensor:
y = [[batteryEnergyContent0]
     [batteryEnergyContent1]
     ...
     [batteryEnergyContent8759]]

model = new MLR(x, y)
model.predict([new prevBatteryEnergyContent, new electricalProductionLoadDiff]) => [new battteryEnergyContent]
model.summary => stats
*/
// TO Consider: Is this really a simple linear regression model?
// We know that the battery energy content is roughly this:
// (prevBatteryEnergyContent + electricalProductionLoadDiff) * (1 - roundTripLosses)
// So can I calculate X in the input tensor as a single variable?

export function trainMlrBatteryModel(gridData) {
  // const shuffledData = _.shuffle(gridData)
  // const sampledData = _.sampleSize(shuffledData, 4000)
  const x = createFeatureTensor(gridData)
  const y = createTargetTensor(gridData)
  const model = new MLR(x, y, { intercept: false }) // no intercept, since battery never hits zero charge
  const { stdError } = model

  // Currently showing 118ms to train, 0.02ms to predict a single prediction.
  // So 8760 predictions, if scaled linearly, would be 175ms (tested at 110ms)
  return {
    trainedBatteryModel: model,
    batteryModelStdError: stdError,
  }
}

// Create array of array inputs: See x in comments above
export function createFeatureTensor(gridData) {
  return _.reduce(
    gridData,
    (result, row, rowIndex, rows) => {
      // First row: there's no prevBatteryEnergyContent. So use first originalBatteryEnergyContent
      const prevBatteryEnergyContent =
        rowIndex === 0
          ? row['originalBatteryEnergyContent']
          : rows[rowIndex - 1]['originalBatteryEnergyContent']

      const feature = [prevBatteryEnergyContent, row['originalElectricalProductionLoadDiff']]
      // const feature = [prevBatteryEnergyContent + row['originalElectricalProductionLoadDiff']]
      result.push(feature)
      return result
    },
    []
  )
}

// Create array of array outputs: See y in comments above
export function createTargetTensor(gridData) {
  return _.map(gridData, row => {
    return [row['originalBatteryEnergyContent']]
  })
}
