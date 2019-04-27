import _ from 'lodash'

export function calcApplianceColumns(appliance) {
  if (_.isEmpty(appliance.fileData)) {
    return []
  }
  const {
    nominalPower,
    dutyCycleDerateFactor,
    productionUnitsPerKwh,
    revenuePerProductionUnits,
    ancillaryEquipmentEfficiency,
  } = appliance
  return _.map(appliance.fileData, row => {
    const newApplianceLoad = row['kwFactor'] * nominalPower * dutyCycleDerateFactor

    const newApplianceAncillaryLoad =
      newApplianceLoad / ancillaryEquipmentEfficiency - newApplianceLoad

    const productionUnits = newApplianceLoad * productionUnitsPerKwh

    const productionUnitsRevenue = revenuePerProductionUnits * productionUnits

    return {
      ...row,
      newApplianceLoad: _.round(newApplianceLoad, 4),
      newApplianceAncillaryLoad: _.round(newApplianceAncillaryLoad, 4),
      productionUnits: _.round(productionUnits, 4),
      productionUnitsRevenue: _.round(productionUnitsRevenue, 4),
    }
  })
}
