import _ from 'lodash'
import {
  countGreaterThanZero,
  percentOfYear,
  mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
  calculateRoi,
  calculatePayback,
} from './helpers'
import { calcAncillaryEquipmentCosts } from '../utils/calcAncillaryEquipmentCosts'

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

  // Unmet Loads: Total with new appliance
  const newUnmetLoadCount = countGreaterThanZero(combinedTable, 'newUnmetLoad')
  const newUnmetLoadCountPercent = percentOfYear(newUnmetLoadCount)
  const newUnmetLoadSum = sumGreaterThanZero(combinedTable, 'newUnmetLoad')

  const newUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'newUnmetLoad'
  )

  const allUnmetLoadHist = mergeArraysOfObjects(
    'hour_of_day',
    originalUnmetLoadHist,
    newUnmetLoadHist
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
  const newApplianceUnmetLoadCost = newUnmetLoadSum * grid['unmetLoadCostPerKwh']

  const newApplianceNetGridRevenue =
    newApplianceGridRevenue - newApplianceElectricityCost - newApplianceUnmetLoadCost

  // Calculate Capex for appliances
  const appliancesWithCapexAssignedToGrid = _.filter(enabledAppliances, appliance => {
    return appliance.capexAssignment === 'grid'
  })
  const appliancesWithCapexAssignedToAppliance = _.filter(enabledAppliances, appliance => {
    return appliance.capexAssignment === 'appliance'
  })

  const applianceCapexAssignedToAppliance = _.sumBy(appliancesWithCapexAssignedToAppliance, 'capex')
  const applianceCapexAssignedToGrid = _.sumBy(appliancesWithCapexAssignedToGrid, 'capex')
  const {
    ancillaryCapexAssignedToAppliance,
    ancillaryCapexAssignedToGrid,
  } = calcAncillaryEquipmentCosts(enabledAppliances)

  const totalCapexAssignedToAppliance =
    applianceCapexAssignedToAppliance + ancillaryCapexAssignedToAppliance
  const totalCapexAssignedToGrid = applianceCapexAssignedToGrid + ancillaryCapexAssignedToGrid

  // Production units makes sense when we are calculating results from a single appliance
  // Otherwise you might have kg rice, kg maize and hours of welding
  const yearlyProductionUnitsRevenue = _.sumBy(combinedTable, 'productionUnitsRevenue')
  const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newApplianceGridRevenue
  const netGridOwnerRevenue = newApplianceNetGridRevenue - newApplianceElectricityCost

  const yearlyProductionUnits = calcYearlyProductionUnits(enabledAppliances)
  const productionUnitType = calcProductionUnitType(enabledAppliances)

  // ROI and Payback
  const applianceOwnerRoi = calculateRoi(netApplianceOwnerRevenue, totalCapexAssignedToAppliance)
  const gridOwnerRoi = calculateRoi(netGridOwnerRevenue, totalCapexAssignedToGrid)

  const applianceOwnerPayback = calculatePayback(
    netApplianceOwnerRevenue,
    totalCapexAssignedToAppliance
  )
  const gridOwnerPayback = calculatePayback(netGridOwnerRevenue, totalCapexAssignedToGrid)
  return {
    // Unmet Load
    originalUnmetLoadCount,
    originalUnmetLoadCountPercent,
    originalUnmetLoadSum: _.round(originalUnmetLoadSum),
    originalUnmetLoadHist,

    newUnmetLoadCount,
    newUnmetLoadCountPercent,
    newUnmetLoadSum: _.round(newUnmetLoadSum),
    newUnmetLoadHist,
    allUnmetLoadHist,

    newApplianceYearlyKwh: _.round(newApplianceYearlyKwh),
    newApplianceGridRevenue: _.round(newApplianceGridRevenue),
    newApplianceElectricityCost: _.round(newApplianceElectricityCost),
    newApplianceUnmetLoadCost: _.round(newApplianceUnmetLoadCost),
    newApplianceNetGridRevenue: _.round(newApplianceNetGridRevenue),

    // yearlyProductionUnits and productionUnitType only makes sense for a single
    // appliance enabled
    yearlyProductionUnits: _.round(yearlyProductionUnits),
    productionUnitType,

    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),
    netApplianceOwnerRevenue: _.round(netApplianceOwnerRevenue),

    // Capex
    applianceCapexAssignedToAppliance: _.round(applianceCapexAssignedToAppliance),
    applianceCapexAssignedToGrid: _.round(applianceCapexAssignedToGrid),
    ancillaryCapexAssignedToAppliance: _.round(ancillaryCapexAssignedToAppliance),
    ancillaryCapexAssignedToGrid: _.round(ancillaryCapexAssignedToGrid),
    totalCapexAssignedToAppliance: _.round(totalCapexAssignedToAppliance),
    totalCapexAssignedToGrid: _.round(totalCapexAssignedToGrid),

    // ROI & Payback
    applianceOwnerRoi: _.round(applianceOwnerRoi),
    gridOwnerRoi: _.round(gridOwnerRoi),
    applianceOwnerPayback: _.round(applianceOwnerPayback, 2),
    gridOwnerPayback: _.round(gridOwnerPayback, 2),
  }
}

function calcYearlyProductionUnits(enabledAppliances) {
  if (_.isEmpty(enabledAppliances)) {
    return 0
  }
  if (_.size(enabledAppliances) > 1) {
    return 'Multiple'
  }
  return enabledAppliances[0].applianceSummaryStats['yearlyProductionUnits']
}

function calcProductionUnitType(enabledAppliances) {
  if (_.isEmpty(enabledAppliances)) {
    return '-'
  }
  if (_.size(enabledAppliances) > 1) {
    return 'Multiple'
  }
  return enabledAppliances[0]['productionUnitType']
}
