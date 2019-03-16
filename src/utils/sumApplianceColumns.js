import _ from 'lodash'

export function sumApplianceColumns(enabledAppliances) {
  if (!_.every(_.map(enabledAppliances, appliance => !_.isEmpty(appliance.fileData)))) {
    return []
  }
  const zippedAppliances = _.zip(..._.map(enabledAppliances, 'calculatedApplianceColumns'))
  return _.map(zippedAppliances, appliancesRow => {
    const newAppliancesLoad = _.sumBy(appliancesRow, 'newApplianceLoad')
    const productionUnitsRevenue = _.sumBy(appliancesRow, 'productionUnitsRevenue')
    return {
      hour: appliancesRow[0]['hour'],
      hour_of_day: appliancesRow[0]['hour_of_day'],
      day_hour: appliancesRow[0]['day_hour'],
      newAppliancesLoad: _.round(newAppliancesLoad, 4),
      productionUnitsRevenue: _.round(productionUnitsRevenue, 4),
    }
  })
}
