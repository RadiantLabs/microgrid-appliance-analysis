import _ from 'lodash'
import regression from 'regression'

// regression.polynomial(data[, options])
// const data = [[0,1],[32, 67] .... [12, 79]]
// const result = regression.polynomial(data, { order: 3 })
export function trainPolyBatteryModel(gridData) {
  const dataPos = _.filter(gridData, row => row['originalElectricalProductionLoadDiff'] > 0)
  const dataNeg = _.filter(gridData, row => row['originalElectricalProductionLoadDiff'] <= 0)

  const dataPosPairs = createNaiveOriginalPairs(dataPos)
  const dataNegPairs = createNaiveOriginalPairs(dataNeg)

  const modelPos = regression.polynomial(_.take(dataPosPairs, 100), { order: 2 })
  const modelNeg = regression.polynomial(_.take(dataNegPairs, 100), { order: 2 })
  return {
    trainedPolyModelPos: modelPos,
    trainedPolyModelNeg: modelNeg,
  }
}

//
// _____________________________________________________________________________
// Features and Targets
// _____________________________________________________________________________
// Create array of array inputs: See x in comments above
export function createNaiveOriginalPairs(gridData) {
  return _.reduce(
    gridData,
    (result, row, rowIndex, rows) => {
      const prevBatteryEnergyContent =
        rowIndex === 0 ? row['originalBatteryEnergyContent'] : result[rowIndex - 1][1] // 0 is yNaive, 1 is yActual. Use actual since this is training data

      const yNaive = prevBatteryEnergyContent + row['originalElectricalProductionLoadDiff']
      const yActual = row['originalBatteryEnergyContent']
      const pair = [yNaive, yActual]
      result.push(pair)
      return result
    },
    []
  )
}
