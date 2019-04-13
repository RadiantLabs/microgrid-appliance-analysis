import _ from 'lodash'

// These yearly summary stats are calculated for every appliance.
// In subsequent summary calculations, only enabled appliances are used.
// Calculations are cached so this is relatively efficient.
export function calcApplianceSummaryStats(applianceColumns) {
  if (_.isEmpty(applianceColumns)) {
    return {}
  }
  // Note: yearlyApplianceLoad is for a single appliance.
  // yearlyAppliancesLoad is later calculated that sums enabled appliance loads
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
