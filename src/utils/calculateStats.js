import _ from 'lodash'
import {
  findColMin,
  findColMax,
  countGreaterThanZero,
  percentOfYear,
  mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
} from './helpers'

export function getHomerStats(homer) {
  const minBatteryEnergyContent = findColMin(homer, 'Battery Energy Content')
  const maxBatteryEnergyContent = findColMax(homer, 'Battery Energy Content')
  // Absolute minimum battery state of charge
  const minbatterySOC = findColMin(homer, 'Battery State of Charge')
  const maxbatterySOC = findColMax(homer, 'Battery State of Charge')

  // Effective Minimum Battery Energy Content
  // When creating a HOMER run, the user determines the minimum (suggested) percent that the
  // battery discharges. In theory, this determines the minimum energy content (kWh) of the
  // battery. But apparently there is a non-linear relationship with the charge percent (state
  // of charge) and the energy content.
  // HOMER starts out the year with a fully charged battery. It looks like HOMER only allows
  // the battery to get to the absolute minimum in the last few hours of the year. So the effective
  // minimum for most of the year is a little higher than that.

  // So to find the effective minimum energy content, first look up the absolute minimum state of
  // charge (minbatterySOC) and round up to the nearest integer.
  // Then go down, hour-by-hour, looking for the first hour we get near that point
  // (within a value of 1, which is 1%).
  const minbatterySOCRowId = _.findIndex(homer, row => {
    return (
      // Round up to nearest integer (ceil) of absolute min
      _.ceil(minbatterySOC) >=
      // Will be greater than rounding down to nearest integer of the current row
      _.floor(row['Battery State of Charge'])
    )
  })
  // If no row meets this condition, just take the absolute min as a fallback.
  // I'm assuming effective min will be within 1% of absolute min, otherwise take absolute
  // That may not be an assumption we want to make.
  // We need to understand HOMER's algorithms better
  const effectiveMinBatteryEnergyContent =
    minbatterySOCRowId > 0 ? homer[minbatterySOCRowId]['Battery Energy Content'] : minbatterySOC

  return {
    minBatteryEnergyContent,
    maxBatteryEnergyContent,
    effectiveMinBatteryEnergyContent,
    minbatterySOC,
    maxbatterySOC,
  }
}

export function getSummaryStats(calculatedColumns, modelInputs) {
  // Unmet Loads: Original without new appliance
  const originalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
    'hour_of_day',
    'originalUnmetLoad'
  )

  // Unmet Loads: Additional Appliance
  const additionalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadCountPercent = percentOfYear(additionalUnmetLoadCount)
  const additionalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'additionalUnmetLoad')
  const additionalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
    'hour_of_day',
    'additionalUnmetLoad'
  )

  // Unmet Loads: Total with new appliance
  const newTotalUnmetLoadCount = countGreaterThanZero(calculatedColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadCountPercent = percentOfYear(newTotalUnmetLoadCount)
  const newTotalUnmetLoadSum = sumGreaterThanZero(calculatedColumns, 'newTotalUnmetLoad')
  const newTotalUnmetLoadHist = createGreaterThanZeroHistogram(
    calculatedColumns,
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
  const newApplianceYearlyKwh = sumGreaterThanZero(calculatedColumns, 'newApplianceLoad')

  // New Appliance kWh revenue for grid operator (cost for appliance owner)
  const newApplianceElectricityRevenue =
    newApplianceYearlyKwh * modelInputs['retailElectricityPrice']

  // Electricity cost to grid operator
  const newApplianceElectricityCost =
    newApplianceYearlyKwh * modelInputs['wholesaleElectricityCost']

  // Cost to grid operator of new appliance's unmet load
  const newApplianceUnmetLoadCost = additionalUnmetLoadSum * modelInputs['unmetLoadCostPerKwh']

  const newApplianceNetRevenue =
    newApplianceElectricityRevenue - newApplianceElectricityCost - newApplianceUnmetLoadCost

  // Calculate production of new appliance based on
  const yearlyProductionUnits = newApplianceYearlyKwh * modelInputs['productionUnitsPerKwh']
  const yearlyProductionUnitsRevenue =
    yearlyProductionUnits * modelInputs['revenuePerProductionUnits']
  const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newApplianceElectricityRevenue

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

    yearlyProductionUnits: yearlyProductionUnits,
    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    netApplianceOwnerRevenue: _.round(netApplianceOwnerRevenue),
  }
}
