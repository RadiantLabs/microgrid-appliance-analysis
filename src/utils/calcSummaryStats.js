import _ from 'lodash'
import { calcAncillaryEquipmentCosts } from '../utils/calcAncillaryEquipmentCosts'
import {
  countGreaterThanZero,
  percentOfYear,
  sumGreaterThanZero,
  calculateRoi,
  calculatePayback,
} from './helpers'

// const countPairs = {
//   newAppliancesLoad: 'originalElectricLoadServed',
//   newAppliancesUnmetLoad: 'originalModeledUnmetLoad',
//   newAppliancesExcessProduction: 'originalModeledExcessProduction',
// }

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
  const originalUnmetLoadCount = _.sumBy(combinedTable, 'originalModeledUnmetLoadCount')
  const originalUnmetLoadCountPercent = percentOfYear(originalUnmetLoadCount)
  const originalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'originalModeledUnmetLoad')

  const newAppliancesUnmetLoadCount = _.sumBy(combinedTable, 'newAppliancesUnmetLoadCount')
  const newAppliancesUnmetLoadCountPercent = percentOfYear(newAppliancesUnmetLoadCount)
  const newAppliancesUnmetLoadSum = sumGreaterThanZero(combinedTable, 'newAppliancesUnmetLoad')

  // Unmet Loads: Total (original + new appliance)
  const totalUnmetLoadCount = _.sumBy(combinedTable, 'totalUnmetLoadCount')
  const totalUnmetLoadCountPercent = percentOfYear(totalUnmetLoadCount)
  const totalUnmetLoadSum = sumGreaterThanZero(combinedTable, 'totalUnmetLoad')

  // ___________________________________________________________________________
  // __ Excess Production ______________________________________________________
  // ___________________________________________________________________________
  // Unmet Loads: Original without new appliance. Output values into a histogram
  const originalExcessProductionCount = _.sumBy(
    combinedTable,
    'originalModeledExcessProductionCount'
  )
  const originalExcessProductionCountPercent = percentOfYear(originalExcessProductionCount)
  const originalExcessProductionSum = sumGreaterThanZero(
    combinedTable,
    'originalModeledExcessProduction'
  )

  const newAppliancesExcessProductionCount = _.sumBy(
    combinedTable,
    'newAppliancesExcessProductionCount'
  )
  const newAppliancesExcessProductionCountPercent = percentOfYear(
    newAppliancesExcessProductionCount
  )
  const newAppliancesExcessProductionSum = sumGreaterThanZero(
    combinedTable,
    'newAppliancesExcessProduction'
  )

  const totalExcessProductionCount = _.sumBy(combinedTable, 'totalExcessProductionCount')
  const totalExcessProductionCountPercent = percentOfYear(totalExcessProductionCount)
  const totalExcessProductionSum = sumGreaterThanZero(combinedTable, 'totalExcessProduction')

  // Yearly unmet load costs
  // `totalUnmetLoadCost` includes original and the new appliances
  // unmet load. So `newAppliancesUnmetLoadCost` should always be positive.
  const originalUnmetLoadCost = originalUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const totalUnmetLoadCost = totalUnmetLoadSum * grid['unmetLoadCostPerKwh']
  const newAppliancesUnmetLoadCost = newAppliancesUnmetLoadSum * grid['unmetLoadCostPerKwh']

  // ___________________________________________________________________________
  // __ Yearly Load Served _____________________________________________________
  // ___________________________________________________________________________
  // Note: Once we add hypothetical appliances, we assume the load is always served
  // using a backup generator or whatever. So there is no distinction between
  // load and load served. We still know what the unmet load is, but we assume
  // something is meeeting that load as well.
  const originalElectricLoadSum = sumGreaterThanZero(combinedTable, 'originalElectricLoadServed')
  const newAppliancesLoadSum = sumGreaterThanZero(combinedTable, 'newAppliancesLoad')
  const totalElectricalLoadSum = originalElectricLoadSum + newAppliancesLoadSum

  // ___________________________________________________________________________
  // __ Financial Calculations _________________________________________________
  // ___________________________________________________________________________
  // Revenue for grid operator due to new appliances
  // This is the appliance owner's operating costs.
  // For clarity, create a new variable for the appliance owner's OpEx
  const newAppliancesGridRevenue = newAppliancesLoadSum * grid['retailElectricityPrice']
  const newAppliancesApplianceOwnerOpex = newAppliancesGridRevenue

  // Electricity cost to grid operator due to new appliances. This is not opex,
  // which includes other costs, such as unmet load.
  const newAppliancesWholesaleElectricityCost =
    newAppliancesLoadSum * grid['wholesaleElectricityCost']
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
    newAppliancesUnmetLoadCount,
    newAppliancesUnmetLoadCountPercent,
    newAppliancesUnmetLoadSum: _.round(newAppliancesUnmetLoadSum),
    totalUnmetLoadCount,
    totalUnmetLoadCountPercent,
    totalUnmetLoadSum: _.round(totalUnmetLoadSum),
    originalUnmetLoadCost: _.round(originalUnmetLoadCost),
    totalUnmetLoadCost: _.round(totalUnmetLoadCost),
    newAppliancesUnmetLoadCost: _.round(newAppliancesUnmetLoadCost),

    // Excess Production
    originalExcessProductionCount,
    originalExcessProductionCountPercent,
    originalExcessProductionSum: _.round(originalExcessProductionSum),
    newAppliancesExcessProductionCount,
    newAppliancesExcessProductionCountPercent,
    newAppliancesExcessProductionSum: _.round(newAppliancesExcessProductionSum),
    totalExcessProductionCount,
    totalExcessProductionCountPercent,
    totalExcessProductionSum: _.round(totalExcessProductionSum),

    originalElectricLoadSum: _.round(originalElectricLoadSum),
    newAppliancesLoadSum: _.round(newAppliancesLoadSum),
    totalElectricalLoadSum: _.round(totalElectricalLoadSum),

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

  // debugOutputValues(returnObject, combinedTable)
  return returnObject
}

//
// _____________________________________________________________________________
// __ Helper functions _________________________________________________________
// _____________________________________________________________________________
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

// _____________________________________________________________________________
// __ Debug functions __________________________________________________________
// _____________________________________________________________________________
// function debugOutputValues(out, table) {
//   console.log('__ load _______________')
//   console.log(
//     'originalElectricLoadSum: ',
//     out.originalElectricLoadSum,
//     _.round(_.sumBy(table, 'originalElectricLoadServed'))
//   )
//   console.log(
//     'newAppliancesLoadSum: ',
//     out.newAppliancesLoadSum,
//     _.round(_.sumBy(table, 'newAppliancesLoad'))
//   )
//   console.log(
//     'totalElectricalLoadSum: ',
//     out.totalElectricalLoadSum,
//     _.round(out.originalElectricLoadSum + out.newAppliancesLoadSum),
//     ' -> ',
//     out.originalElectricLoadSum + out.newAppliancesLoadSum
//   )

//   console.log('__ unmet load _________')
//   console.log(
//     'originalUnmetLoadSum: ',
//     out.originalUnmetLoadSum,
//     _.round(_.sumBy(table, 'originalUnmetLoad'))
//   )
//   console.log(
//     'newAppliancesUnmetLoadSum: ',
//     out.newAppliancesUnmetLoadSum,
//     _.round(_.sumBy(table, 'newAppliancesUnmetLoad'))
//   )
//   console.log(
//     'totalUnmetLoadSum: ',
//     out.totalUnmetLoadSum,
//     _.round(_.sumBy(table, 'totalUnmetLoad')),
//     ' -> ',
//     out.originalUnmetLoadSum + out.newAppliancesUnmetLoadSum
//   )

//   console.log('__ excess production _________')
//   console.log(
//     'originalExcessProductionSum: ',
//     out.originalExcessProductionSum,
//     _.round(_.sumBy(table, 'originalExcessProduction'))
//   )
//   console.log(
//     'newAppliancesExcessProductionSum: ',
//     out.newAppliancesExcessProductionSum,
//     _.round(_.sumBy(table, 'newAppliancesExcessProduction'))
//   )
//   console.log(
//     'totalExcessProductionSum: ',
//     out.totalExcessProductionSum,
//     _.round(_.sumBy(table, 'totalExcessProduction')),
//     ' -> ',
//     out.originalExcessProductionSum + out.newAppliancesExcessProductionSum
//   )
// }
