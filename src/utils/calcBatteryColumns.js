import _ from 'lodash'

export function calcBatteryColumns({
  gridData,
  appliances,
  batteryMinEnergyContent,
  batteryMaxEnergyContent,
}) {
  if (
    _.isEmpty(gridData) ||
    _.isEmpty(appliances) ||
    !batteryMinEnergyContent ||
    !batteryMaxEnergyContent
  ) {
    return []
  }
  const startingBatteryEnergyContent = _.first(gridData)['Battery Energy Content']
  const inputs = _.map(gridData, (row, rowIndex) => {
    const applianceRow = appliances[rowIndex]
    const totalElectricalProduction = row['Total Renewable Power Output']
    const totalElectricalLoadServed =
      row['Total Electrical Load Served'] + applianceRow['newAppliancesLoad']
    const electricalProductionLoadDiff = totalElectricalProduction - totalElectricalLoadServed
    return {
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      totalElectricalLoadServed: _.round(totalElectricalLoadServed, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),
      predictedBatteryEnergyContent: null,
    }
  })
  const predictedBatteryEnergyContent = predictBatteryEnergyContent({
    inputs,
    startingBatteryEnergyContent,
    batteryMinEnergyContent,
    batteryMaxEnergyContent,
  })
  return _.map(inputs, (row, rowIndex) => {
    return {
      ...row,
      ...predictedBatteryEnergyContent[rowIndex],
    }
  })
}

function predictBatteryEnergyContent({
  inputs,
  startingBatteryEnergyContent,
  batteryMinEnergyContent,
  batteryMaxEnergyContent,
}) {
  return {
    predictedBatteryEnergyContent: [],
  }
}
