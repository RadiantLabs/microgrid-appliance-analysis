import _ from 'lodash'
import {
  countGreaterThanZero,
  percentOfYear,
  mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
} from './helpers'

export function calcSummaryStats(grid, combinedTable, enabledAppliances) {
  if (_.isEmpty(grid) || _.isEmpty(combinedTable) || _.isEmpty(enabledAppliances)) {
    return {}
  }

  // Unmet Loads: Original without new appliance
  const originalUnmetLoadCount = countGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'originalUnmetLoad'
  )

  // Unmet Loads: Additional Appliance
  const additionalUnmetLoadCount = countGreaterThanZero(combinedTable, 'additionalUnmetLoad')
  const additionalUnmetLoadCountPercent = percentOfYear(additionalUnmetLoadCount)
  const additionalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'additionalUnmetLoad')
  const additionalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'additionalUnmetLoad'
  )

  // Unmet Loads: Total with new appliance
  const newTotalUnmetLoadCount = countGreaterThanZero(combinedTable, 'newTotalUnmetLoad')
  const newTotalUnmetLoadCountPercent = percentOfYear(newTotalUnmetLoadCount)
  const newTotalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'newTotalUnmetLoad')
  const newTotalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'newTotalUnmetLoad'
  )

  const allUnmetLoadHist = mergeArraysOfObjects(
    'hour_of_day',
    originalUnmetLoadHist,
    additionalUnmetLoadHist,
    newTotalUnmetLoadHist
  )

  // Yearly kWh and Financial Calculations
  // New Appliance kWh for the year
  const newApplianceYearlyKwh = sumGreaterThanZero(combinedTable, 'newAppliancesLoad')

  // New Appliance kWh revenue for grid operator (cost for appliance owner)
  // This is the appliance owner cost
  const newApplianceGridRevenue = newApplianceYearlyKwh * grid['retailElectricityPrice']

  // Electricity cost to grid operator
  const newApplianceElectricityCost = newApplianceYearlyKwh * grid['wholesaleElectricityCost']

  // Cost to grid operator of new appliance's unmet load
  const newApplianceUnmetLoadCost = additionalUnmetLoadSum * grid['unmetLoadCostPerKwh']

  const newApplianceNetGridRevenue =
    newApplianceGridRevenue - newApplianceElectricityCost - newApplianceUnmetLoadCost

  // const gridApplianceCapex = capexAssignment === 'grid' ?

  // Production units makes sense when we are calculating results from a single appliance
  // Otherwise you might have kg rice, kg maize and hours of welding
  const yearlyProductionUnitsRevenue = _.sumBy(combinedTable, 'productionUnitsRevenue')
  const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newApplianceGridRevenue
  return {
    originalUnmetLoadCount,
    originalUnmetLoadCountPercent,
    originalUnmetLoadSum: _.round(originalUnmetLoadSum),
    originalUnmetLoadHist,

    additionalUnmetLoadCount,
    additionalUnmetLoadCountPercent,
    additionalUnmetLoadSum: _.round(additionalUnmetLoadSum),
    additionalUnmetLoadHist,

    newTotalUnmetLoadCount,
    newTotalUnmetLoadCountPercent,
    newTotalUnmetLoadSum: _.round(newTotalUnmetLoadSum),
    newTotalUnmetLoadHist,

    allUnmetLoadHist,

    newApplianceYearlyKwh: _.round(newApplianceYearlyKwh),
    newApplianceGridRevenue: _.round(newApplianceGridRevenue),
    newApplianceElectricityCost: _.round(newApplianceElectricityCost),
    newApplianceUnmetLoadCost: _.round(newApplianceUnmetLoadCost),
    newApplianceNetGridRevenue: _.round(newApplianceNetGridRevenue),

    // yearlyProductionUnits: yearlyProductionUnits,
    // yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    netApplianceOwnerRevenue: _.round(netApplianceOwnerRevenue),
  }
}
