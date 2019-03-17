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

  return _.map(gridData, (row, rowIndex) => {
    const applianceRow = appliances[rowIndex]
    const totalElectricalProduction = row['Total Renewable Power Output']
    const totalElectricalLoadServed =
      row['Total Electrical Load Served'] + applianceRow['newAppliancesLoad']
    const electricalProductionLoadDiff = totalElectricalProduction - totalElectricalLoadServed
    return {
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      totalElectricalLoadServed: _.round(totalElectricalLoadServed, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),
    }
  })
}
