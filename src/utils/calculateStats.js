import _ from 'lodash'
import {
  countGreaterThanZero,
  percentOfYear,
  mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
} from './helpers'

export function getSummaryStats(hybridColumns, activeGrid) {
  // Unmet Loads: Original without new appliance
  const originalUnmetLoadCount = countGreaterThanZero(hybridColumns, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(hybridColumns, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    hybridColumns,
    'hour_of_day',
    'originalUnmetLoad'
  )

  // Unmet Loads: Additional Appliance
  const additionalUnmetLoadCount = countGreaterThanZero(hybridColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadCountPercent = percentOfYear(additionalUnmetLoadCount)
  const additionalUnmetLoadSum = sumGreaterThanZero(hybridColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadHist = createGreaterThanZeroHistogram(
    hybridColumns,
    'hour_of_day',
    'additionalUnmetLoad'
  )

  // Unmet Loads: Total with new appliance
  const newTotalUnmetLoadCount = countGreaterThanZero(hybridColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadCountPercent = percentOfYear(newTotalUnmetLoadCount)
  const newTotalUnmetLoadSum = sumGreaterThanZero(hybridColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadHist = createGreaterThanZeroHistogram(
    hybridColumns,
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
  const newApplianceYearlyKwh = sumGreaterThanZero(hybridColumns, 'newAppliancesLoad')

  // New Appliance kWh revenue for grid operator (cost for appliance owner)
  const newApplianceElectricityRevenue =
    newApplianceYearlyKwh * activeGrid['retailElectricityPrice']

  // Electricity cost to grid operator
  const newApplianceElectricityCost = newApplianceYearlyKwh * activeGrid['wholesaleElectricityCost']

  // Cost to grid operator of new appliance's unmet load
  const newApplianceUnmetLoadCost = additionalUnmetLoadSum * activeGrid['unmetLoadCostPerKwh']

  const newApplianceNetRevenue =
    newApplianceElectricityRevenue - newApplianceElectricityCost - newApplianceUnmetLoadCost

  // Calculate production of new appliance based on
  // const yearlyProductionUnits = newApplianceYearlyKwh * modelInputs['productionUnitsPerKwh']

  // TODO:
  // Production units makes sense when we are calculating results from a single appliance
  // Otherwise you might have kg rice, kg maize and hours of welding
  // But shouldn't I do this? This should be a derived column on the appliance model
  // calculateNewApplianceColumns should live on the appliance model
  // const yearlyProductionUnits = sumGreaterThanZero(hybridColumns, 'productionUnits')

  // const yearlyProductionUnitsRevenue =
  //   yearlyProductionUnits * modelInputs['revenuePerProductionUnits']
  // const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newApplianceElectricityRevenue
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
    newApplianceElectricityRevenue: _.round(newApplianceElectricityRevenue),
    newApplianceElectricityCost: _.round(newApplianceElectricityCost),
    newApplianceUnmetLoadCost: _.round(newApplianceUnmetLoadCost),
    newApplianceNetRevenue: _.round(newApplianceNetRevenue),

    // yearlyProductionUnits: yearlyProductionUnits,
    // yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    // netApplianceOwnerRevenue: _.round(netApplianceOwnerRevenue),
    yearlyProductionUnitsRevenue: 0,
    netApplianceOwnerRevenue: 0,
  }
}
