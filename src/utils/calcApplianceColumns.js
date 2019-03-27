import _ from 'lodash'

export function calcApplianceColumns(appliance) {
  if (_.isEmpty(appliance.fileData) || !appliance.enabled) {
    return []
  }
  const {
    nominalPower,
    dutyCycleDerateFactor,
    productionUnitsPerKwh,
    revenuePerProductionUnits,
  } = appliance
  return _.map(appliance.fileData, row => {
    const newApplianceLoad = row['kw_factor'] * nominalPower * dutyCycleDerateFactor
    const productionUnits = newApplianceLoad * productionUnitsPerKwh
    const productionUnitsRevenue = revenuePerProductionUnits * productionUnits
    return {
      ...row,
      newApplianceLoad: _.round(newApplianceLoad, 4),
      productionUnits: _.round(productionUnits, 4),
      productionUnitsRevenue: _.round(productionUnitsRevenue, 4),
    }
  })
}
