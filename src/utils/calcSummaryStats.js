import _ from 'lodash'
import { calcAncillaryEquipmentCosts } from '../utils/calcAncillaryEquipmentCosts'
import {
  countGreaterThanZero,
  percentOfYear,
  mergeArraysOfObjects,
  sumGreaterThanZero,
  createGreaterThanZeroHistogram,
  calculateRoi,
  calculatePayback,
} from './helpers'

// This is the final yearly summary stats calculation, incorporating:
// * all enabled appliances
// * all enabled ancillary equipment
// * active grid
export function calcSummaryStats(grid, combinedTable, enabledAppliances) {
  if (_.isEmpty(grid) || _.isEmpty(combinedTable) || _.isEmpty(enabledAppliances)) {
    return {}
  }

  // == Unmet load histograms ==================================================
  // Unmet Loads: Original without new appliance. Output values into a histogram
  // data object for charts
  const originalUnmetLoadCount = countGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'originalUnmetLoad'
  )

  // Unmet Loads: Total (original + new appliance)
  const newUnmetLoadCount = countGreaterThanZero(combinedTable, 'newUnmetLoad')
  const newUnmetLoadCountPercent = percentOfYear(newUnmetLoadCount)
  const newUnmetLoadSum = sumGreaterThanZero(combinedTable, 'newUnmetLoad')
  const newUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hour_of_day',
    'newUnmetLoad'
  )

  // Create a histogram object that combined both originalUnmetLoadCount and newUnmetLoadCount
  const allUnmetLoadHist = mergeArraysOfObjects(
    'hour_of_day',
    originalUnmetLoadHist,
    newUnmetLoadHist
  )

  // == Yearly kWh & Financial Calculations ====================================
  // Sum yearly kWh for only new appliances added, not including original HOMER load
  const newAppliancesYearlyKwh = sumGreaterThanZero(combinedTable, 'newAppliancesLoad')

  // Revenue for grid operator due to new appliances
  // This is the appliance owner's operating costs.
  // For clarity, create a new variable for the appliance owner's opex
  const newAppliancesGridRevenue = newAppliancesYearlyKwh * grid['retailElectricityPrice']
  const newAppliancesApplianceOwnerOpex = newAppliancesGridRevenue

  // Electricity cost to grid operator due to new appliances. This is not opex,
  // which may include other costs, such as unmet load.
  const newAppliancesWholesaleElectricityCost =
    newAppliancesYearlyKwh * grid['wholesaleElectricityCost']

  // Yearly unmet load costs. `newUnmetLoadCost` includes original and the new appliances
  // unmet load. So `newAppliancesUnmetLoadCost` should always be positive.
  const originalUnmetLoadCost = originalUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const newUnmetLoadCost = newUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const newAppliancesUnmetLoadCost = newUnmetLoadCost - originalUnmetLoadCost

  // Net income for grid operator due to new appliances.
  const newAppliancesGridNetIncome =
    newAppliancesGridRevenue - newAppliancesWholesaleElectricityCost - newUnmetLoadCost

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
  const netApplianceOwnerRevenue = yearlyProductionUnitsRevenue - newAppliancesGridRevenue

  // TODO (Error): newAppliancesGridNetIncome already takes into account newAppliancesWholesaleElectricityCost
  const netGridOwnerRevenue = newAppliancesGridNetIncome - newAppliancesWholesaleElectricityCost

  const yearlyProductionUnits = calcYearlyProductionUnits(enabledAppliances)
  const productionUnitType = calcProductionUnitType(enabledAppliances)

  // ROI and Payback
  const applianceOwnerRoi = calculateRoi(netApplianceOwnerRevenue, totalCapexAssignedToAppliance)
  const gridOwnerRoi = calculateRoi(netGridOwnerRevenue, totalCapexAssignedToGrid)

  // console.log('__ ROI _________________')
  // console.log(
  //   'applianceOwnerRoi, netApplianceOwnerRevenue, totalCapexAssignedToAppliance',
  //   applianceOwnerRoi,
  //   netApplianceOwnerRevenue,
  //   totalCapexAssignedToAppliance
  // )
  // console.log(
  //   'gridOwnerRoi, calculateRoi(netGridOwnerRevenue, totalCapexAssignedToGrid',
  //   gridOwnerRoi,
  //   netGridOwnerRevenue,
  //   totalCapexAssignedToGrid
  // )

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

    newAppliancesYearlyKwh: _.round(newAppliancesYearlyKwh),
    newAppliancesGridRevenue: _.round(newAppliancesGridRevenue),
    newAppliancesApplianceOwnerOpex: _.round(newAppliancesApplianceOwnerOpex),
    newAppliancesWholesaleElectricityCost: _.round(newAppliancesWholesaleElectricityCost),

    originalUnmetLoadCost: _.round(originalUnmetLoadCost),
    newUnmetLoadCost: _.round(newUnmetLoadCost),
    newAppliancesUnmetLoadCost: _.round(newAppliancesUnmetLoadCost),

    newAppliancesGridNetIncome: _.round(newAppliancesGridNetIncome),

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
