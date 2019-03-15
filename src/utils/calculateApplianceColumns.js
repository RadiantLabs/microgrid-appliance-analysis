import _ from 'lodash'

export function calculateApplianceColumns(appliance) {
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

// export function calculateApplianceColumns(enabledAppliances) {
//   if (!_.every(_.map(enabledAppliances, appliance => !_.isEmpty(appliance.fileData)))) {
//     return []
//   }
//   const appliancesWithNewColummns = _.map(enabledAppliances, appliance => {
//     const {
//       nominalPower,
//       dutyCycleDerateFactor,
//       productionUnitsPerKwh,
//       revenuePerProductionUnits,
//     } = appliance
//     return _.map(appliance.fileData, row => {
//       const newApplianceLoad = row['kw_factor'] * nominalPower * dutyCycleDerateFactor
//       const productionUnits = newApplianceLoad * productionUnitsPerKwh
//       const productionUnitsRevenue = revenuePerProductionUnits * productionUnits
//       return {
//         ...row,
//         newApplianceLoad,
//         productionUnits,
//         productionUnitsRevenue,
//       }
//     })
//   })
//   const multipleAppliances = _.size(enabledAppliances) > 1
//   const zippedAppliances = _.zip(...appliancesWithNewColummns)
//   return _.map(zippedAppliances, appliancesRow => {
//     const newAppliancesLoad = _.sumBy(appliancesRow, 'newApplianceLoad')
//     const productionUnitsRevenue = _.sumBy(appliancesRow, 'productionUnitsRevenue')
//     return {
//       hour: appliancesRow[0]['hour'],
//       hour_of_day: appliancesRow[0]['hour_of_day'],
//       day_hour: appliancesRow[0]['day_hour'],
//       newAppliancesLoad: _.round(newAppliancesLoad, 4),
//       productionUnitsRevenue: _.round(productionUnitsRevenue, 4),
//       kw_factor: multipleAppliances ? 'Multiple' : appliancesRow[0]['kw_factor'],
//     }
//   })
// }
