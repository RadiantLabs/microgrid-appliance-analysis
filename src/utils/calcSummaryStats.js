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

  // ___________________________________________________________________________
  // __ Unmet load _____________________________________________________________
  // ___________________________________________________________________________
  // Unmet Loads: Original without new appliance. Output values into a histogram
  // data object for charts
  const originalUnmetLoadCount = countGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'originalUnmetLoad')
  const originalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'originalUnmetLoad'
  )

  const newAppliancesUnmetLoadCount = countGreaterThanZero(combinedTable, 'newAppliancesUnmetLoad')
  const newAppliancesUnmetLoadCountPercent = percentOfYear(newAppliancesUnmetLoadCount)
  const newAppliancesUnmetLoadSum = sumGreaterThanZero(combinedTable, 'newAppliancesUnmetLoad')
  const newAppliancesUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'newAppliancesUnmetLoad'
  )

  // Unmet Loads: Total (original + new appliance)
  const totalUnmetLoadCount = countGreaterThanZero(combinedTable, 'totalUnmetLoad')
  const totalUnmetLoadCountPercent = percentOfYear(totalUnmetLoadCount)
  const totalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'totalUnmetLoad')
  const totalUnmetLoadHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'totalUnmetLoad'
  )

  // Create a histogram object that combined both originalUnmetLoadCount and totalUnmetLoadCount
  const allUnmetLoadHist = mergeArraysOfObjects(
    'hourOfDay',
    originalUnmetLoadHist,
    totalUnmetLoadHist
  )

  // ___________________________________________________________________________
  // __ Excess Production ______________________________________________________
  // ___________________________________________________________________________
  // Unmet Loads: Original without new appliance. Output values into a histogram
  const originalExcessProductionCount = countGreaterThanZero(
    combinedTable,
    'originalExcessProduction'
  )
  const originalExcessProductionCountPercent = percentOfYear(originalExcessProductionCount)
  const originalExcessProductionSum = sumGreaterThanZero(combinedTable, 'originalExcessProduction')
  const originalExcessProductionHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'originalExcessProduction'
  )

  const newAppliancesExcessProductionCount = countGreaterThanZero(
    combinedTable,
    'newAppliancesUnmetLoad'
  )
  const newAppliancesExcessProductionCountPercent = percentOfYear(
    newAppliancesExcessProductionCount
  )
  const newAppliancesExcessProductionSum = sumGreaterThanZero(
    combinedTable,
    'newAppliancesExcessProduction'
  )
  const newAppliancesExcessProductionHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'newAppliancesExcessProduction'
  )

  const totalExcessProductionCount = countGreaterThanZero(combinedTable, 'totalExcessProduction')
  const totalExcessProductionCountPercent = percentOfYear(totalExcessProductionCount)
  const totalExcessProductionSum = sumGreaterThanZero(combinedTable, 'totalExcessProduction')
  const totalExcessProductionHist = createGreaterThanZeroHistogram(
    combinedTable,
    'hourOfDay',
    'totalExcessProduction'
  )

  const allExcessProductionHist = mergeArraysOfObjects(
    'hourOfDay',
    originalUnmetLoadHist,
    totalUnmetLoadHist
  )

  // Yearly unmet load costs
  // `totalUnmetLoadCost` includes original and the new appliances
  // unmet load. So `newAppliancesUnmetLoadCost` should always be positive.
  const originalUnmetLoadCost = originalUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const totalUnmetLoadCost = totalUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const newAppliancesUnmetLoadCost = newAppliancesUnmetLoadSum * grid['unmetLoadCostPerKwh']

  // ___________________________________________________________________________
  // __ Yearly Load Served _____________________________________________________
  // ___________________________________________________________________________
  // Sum yearly kWh for only new appliances added, not including original HOMER load
  // TODO: how does Original Electric Load Served compare with originalElectricLoad
  const originalElectricLoadSum = sumGreaterThanZero(
    combinedTable,
    'Original Electrical Load Served'
  )
  const newAppliancesYearlyKwh = sumGreaterThanZero(combinedTable, 'newAppliancesLoad')
  // TODO: how do I do totalElectricalLoadServed?
  // We need to take into account newAppliancesYearlyKwh and unmet load

  // ___________________________________________________________________________
  // __ Financial Calculations _________________________________________________
  // ___________________________________________________________________________
  // Revenue for grid operator due to new appliances
  // This is the appliance owner's operating costs.
  // For clarity, create a new variable for the appliance owner's OpEx
  const newAppliancesGridRevenue = newAppliancesYearlyKwh * grid['retailElectricityPrice']
  const newAppliancesApplianceOwnerOpex = newAppliancesGridRevenue

  // Electricity cost to grid operator due to new appliances. This is not opex,
  // which includes other costs, such as unmet load.
  const newAppliancesWholesaleElectricityCost =
    newAppliancesYearlyKwh * grid['wholesaleElectricityCost']
  const gridOperatorNewAppliancesOpex =
    newAppliancesWholesaleElectricityCost + newAppliancesUnmetLoadCost

  // __ CapEx __________________________________________________________________
  // First filter by capexAssignment (grid or appliance). Then add up their costs
  // and assign them to either the grid owner or appliance owner.
  // Do this same thing for enabled ancillary equipment. Then sum it up.
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

  // __ Production revenue from appliances _____________________________________
  // Production units only makes sense when we are calculating results from a single
  // appliance because you can't combine kg rice, kg maize and hours of welding.
  // But you can sum revenue from those production units.
  const yearlyProductionUnits = calcYearlyProductionUnits(enabledAppliances)
  const productionUnitType = calcProductionUnitType(enabledAppliances)
  const yearlyProductionUnitsRevenue = _.sumBy(combinedTable, 'productionUnitsRevenue')

  // __ Net Income _____________________________________________________________
  // Net income for grid operator due to new appliances
  const gridOperatorNewAppliancesNetIncome =
    newAppliancesGridRevenue - newAppliancesWholesaleElectricityCost - newAppliancesUnmetLoadCost
  const applianceOperatorNewAppliancesNetIncome =
    yearlyProductionUnitsRevenue - newAppliancesApplianceOwnerOpex

  // __ ROI & Payback __________________________________________________________
  const gridOwnerRoi = calculateRoi(gridOperatorNewAppliancesNetIncome, totalCapexAssignedToGrid)
  const applianceOwnerRoi = calculateRoi(
    applianceOperatorNewAppliancesNetIncome,
    totalCapexAssignedToAppliance
  )

  const gridOwnerPayback = calculatePayback(
    gridOperatorNewAppliancesNetIncome,
    totalCapexAssignedToGrid
  )
  const applianceOwnerPayback = calculatePayback(
    applianceOperatorNewAppliancesNetIncome,
    totalCapexAssignedToAppliance
  )

  const returnObject = {
    // Unmet Load
    originalUnmetLoadCount,
    originalUnmetLoadCountPercent,
    originalUnmetLoadSum: _.round(originalUnmetLoadSum),
    originalUnmetLoadHist,
    newAppliancesUnmetLoadCount,
    newAppliancesUnmetLoadCountPercent,
    newAppliancesUnmetLoadSum: _.round(newAppliancesUnmetLoadSum),
    newAppliancesUnmetLoadHist,
    totalUnmetLoadCount,
    totalUnmetLoadCountPercent,
    totalUnmetLoadSum: _.round(totalUnmetLoadSum),
    totalUnmetLoadHist,
    allUnmetLoadHist,
    originalUnmetLoadCost: _.round(originalUnmetLoadCost),
    totalUnmetLoadCost: _.round(totalUnmetLoadCost),
    newAppliancesUnmetLoadCost: _.round(newAppliancesUnmetLoadCost),

    // Excess Production
    originalExcessProductionCount,
    originalExcessProductionCountPercent,
    originalExcessProductionSum: _.round(originalExcessProductionSum),
    originalExcessProductionHist,
    newAppliancesExcessProductionCount,
    newAppliancesExcessProductionCountPercent,
    newAppliancesExcessProductionSum: _.round(newAppliancesExcessProductionSum),
    newAppliancesExcessProductionHist,
    totalExcessProductionCount,
    totalExcessProductionCountPercent,
    totalExcessProductionSum: _.round(totalExcessProductionSum),
    totalExcessProductionHist,
    allExcessProductionHist,

    newAppliancesYearlyKwh: _.round(newAppliancesYearlyKwh),
    // newAppliancesLoadSum: _.round(newAppliancesLoadSum),  // TODO: Change variable names
    originalElectricLoadSum: _.round(originalElectricLoadSum),

    newAppliancesGridRevenue: _.round(newAppliancesGridRevenue),
    newAppliancesApplianceOwnerOpex: _.round(newAppliancesApplianceOwnerOpex),
    newAppliancesWholesaleElectricityCost: _.round(newAppliancesWholesaleElectricityCost),
    gridOperatorNewAppliancesOpex: _.round(gridOperatorNewAppliancesOpex),

    yearlyProductionUnits,
    productionUnitType,
    yearlyProductionUnitsRevenue: _.round(yearlyProductionUnitsRevenue),

    // Capex
    applianceCapexAssignedToAppliance: _.round(applianceCapexAssignedToAppliance),
    applianceCapexAssignedToGrid: _.round(applianceCapexAssignedToGrid),
    ancillaryCapexAssignedToAppliance: _.round(ancillaryCapexAssignedToAppliance),
    ancillaryCapexAssignedToGrid: _.round(ancillaryCapexAssignedToGrid),
    totalCapexAssignedToAppliance: _.round(totalCapexAssignedToAppliance),
    totalCapexAssignedToGrid: _.round(totalCapexAssignedToGrid),

    // Net Income
    gridOperatorNewAppliancesNetIncome: _.round(gridOperatorNewAppliancesNetIncome),
    applianceOperatorNewAppliancesNetIncome: _.round(applianceOperatorNewAppliancesNetIncome),

    // ROI & Payback
    // TODO: Update lodash on next major release which has release with the isFinite check
    gridOwnerRoi: _.round(gridOwnerRoi),
    applianceOwnerRoi: _.round(applianceOwnerRoi),
    gridOwnerPayback: _.isFinite(gridOwnerPayback)
      ? _.round(gridOwnerPayback, 1)
      : gridOwnerPayback,
    applianceOwnerPayback: _.isFinite(applianceOwnerPayback)
      ? _.round(applianceOwnerPayback, 1)
      : applianceOwnerPayback,
  }

  debugOutputValues(returnObject, combinedTable)
  return returnObject
}

// TODO: In the case of multiple appliances, return an object with keys as
// appliance name and values as production units
function calcYearlyProductionUnits(enabledAppliances) {
  if (_.isEmpty(enabledAppliances)) {
    return 0
  }
  if (_.size(enabledAppliances) > 1) {
    return 'Multiple'
  }
  return _.round(enabledAppliances[0].applianceSummaryStats['yearlyProductionUnits'])
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

function debugOutputValues(out, combinedTable) {
  console.log('__ load _______________')
  console.log('stat newAppliancesYearlyKwh: ', out.newAppliancesYearlyKwh)
  // console.log('')

  console.log('__ unmet load _________')
  console.log('stat originalUnmetLoadSum: ', out.originalUnmetLoadSum)
  console.log('man  originalUnmetLoadSum: ', _.sumBy(combinedTable, 'originalUnmetLoad'))
  console.log('stat newAppliancesUnmetLoadSum: ', out.newAppliancesUnmetLoadSum)
  console.log('man  newAppliancesUnmetLoadSum: ', _.sumBy(combinedTable, 'newAppliancesUnmetLoad'))
  console.log('stat totalUnmetLoadSum: ', out.totalUnmetLoadSum)
  console.log('man  totalUnmetLoadSum: ', _.sumBy(combinedTable, 'totalUnmetLoad'))
}
