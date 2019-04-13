import _ from 'lodash'

// Sum, on an hourly basis, values from enabled appliances and their enabled
// ancillary equipment

// Note: kw_factor only makes sense for a single appliance type, so we are not
// summing it here. kw_factor is the number of minutes an appliance was fully
// utilized, summed over an hour. If it was running at 50% RPM, the factor for
// 1 minute is less than if it was at 100% RPM
export function sumApplianceColumns(enabledAppliances) {
  if (_.isEmpty(enabledAppliances)) {
    return emptyApplianceRows
  }
  const zippedAppliances = _.zip(..._.map(enabledAppliances, 'calculatedApplianceColumns'))
  return _.map(zippedAppliances, appliancesRow => {
    const newAppliancesLoad = _.sumBy(appliancesRow, 'newApplianceLoad')
    const newAppliancesAncillaryLoad = _.sumBy(appliancesRow, 'newApplianceAncillaryLoad')
    const productionUnitsRevenue = _.sumBy(appliancesRow, 'productionUnitsRevenue')
    return {
      hour: appliancesRow[0]['hour'],
      hour_of_day: appliancesRow[0]['hour_of_day'],
      day_hour: appliancesRow[0]['day_hour'],
      newAppliancesLoad: _.round(newAppliancesLoad, 4),
      newAppliancesAncillaryLoad: _.round(newAppliancesAncillaryLoad, 4),
      productionUnitsRevenue: _.round(productionUnitsRevenue, 4),
    }
  })
}

// Someone can deselect all appliances. When they do, the grid should behave as
// the original HOMER file modeled it. So pass in an empty array of objects so
// subsequent checks and calculations still work.
const emptyApplianceRows = _.map(_.range(0, 8760), hour => {
  return {
    hour,
    hour_of_day: null,
    day_hour: null,
    newAppliancesLoad: 0,
    productionUnitsRevenue: 0,
  }
})
