import _ from 'lodash'
// import regression from 'regression'

// E(n): Battery energy content at hour n
// L(E): Efficiency loss coefficient of the battery charging at energy E (greater near battery max and min)
// C(n): Charge energy added or pulled from the battery at hour n (same units as E(n) because it's over an hour)

// E(n) = E(n-1) + L(E) * C(n), therefore
// L(E) = E(n) - E(n-1) / C(n)
// Find L(E) for charging (pos) and discharging (neg)
export function trainLossCoeffBatteryModel(gridData, batteryMin, batteryMax) {
  // const dataPos = _.filter(gridData, row => row['originalElectricalProductionLoadDiff'] > 0)
  // const dataPos = _.slice(gridData, 33, 42)
  // const dataNeg = _.slice(
  //   _.filter(gridData, row => row['originalElectricalProductionLoadDiff'] <= 0),
  //   0,
  //   30
  // )

  const lossCoeffData = calcLossCoeffPlottableData(gridData)
  // const lossCoeffPosData = calcLossCoeffPlottableData(dataPos)
  // const lossCoeffNegData = calcLossCoeffPlottableData(dataNeg)

  // TODO: from lossCoeffPosData, find regression
  // const modelPos = regression.polynomial(_.take(dataPosPairs, 100), { order: 2 })
  // const modelNeg = regression.polynomial(_.take(dataNegPairs, 100), { order: 2 })
  // const posSlice =  _.slice(gridData, 31, 42)
  // const modelPosPairs = _.map(posSlice, row => {
  //   return [row['originalElectricalProductionLoadDiff'], row['originalBatteryEnergyContent']]
  // })

  return {
    lossCoeffData,
    // lossCoeffPosData,
    // lossCoeffNegData,
    // trainedLossCoeffPos: () => 0.8,
    // trainedLossCoeffNeg: () => 1.2,
  }
}

//
// _____________________________________________________________________________
// Calculate Loss Coefficients
// _____________________________________________________________________________
export function calcLossCoeffPlottableData(gridData) {
  return _.reduce(
    gridData,
    (result, row, rowIndex) => {
      const bateryEnergyContent = row['originalBatteryEnergyContent']
      const chargeDiff = row['originalElectricalProductionLoadDiff']

      const prevBatteryEnergyContent =
        rowIndex === 0 ? bateryEnergyContent : result[rowIndex - 1]['bateryEnergyContent']

      const prevChargeDiff = rowIndex === 0 ? chargeDiff : result[rowIndex - 1]['chargeDiff']
      const batteryDiff = bateryEnergyContent - prevBatteryEnergyContent
      const coeff = prevChargeDiff === 0 || batteryDiff === 0 ? 0 : batteryDiff / prevChargeDiff

      if (!_.isFinite(coeff)) {
        debugger
      }

      // The coefficient is all over the place. It's oscillating in a way that isn't obvious
      // What if the coefficient was a function of the magnitude of the chargeDiff?
      // I need to plot coeff vs. chargeDiff
      result.push({
        rowIndex,
        bateryEnergyContent,
        prevBatteryEnergyContent,
        batteryDiff,
        chargeDiff,
        prevChargeDiff,
        coeff,
      })
      return result
    },
    []
  )
}
