import _ from 'lodash'

export function calcApplianceSummaryStats(applianceColumns) {
  if (_.isEmpty(applianceColumns)) {
    return {}
  }
  const yearlyApplianceLoad = _.sumBy(applianceColumns, 'newApplianceLoad')
  const yearlyProductionUnits = _.sumBy(applianceColumns, 'productionUnits')
  const yearlyProductionUnitsRevenue = _.sumBy(applianceColumns, 'productionUnitsRevenue')
  const yearlyAncillaryEquipmentLoad = _.sumBy(applianceColumns, 'ancillaryEquipmentLoad')
  return {
    yearlyApplianceLoad: _.round(yearlyApplianceLoad, 4),
    yearlyAncillaryEquipmentLoad: _.round(yearlyAncillaryEquipmentLoad, 4),
    yearlyProductionUnits: _.round(yearlyProductionUnits, 4),
    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue, 4),
  }
}
