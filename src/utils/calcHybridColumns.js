import _ from 'lodash'
import { predictBatteryEnergyContent } from './predictBatteryEnergyContent'
import { unmetLoadRoundingDecimals, excessProductionRoundingDecimals } from '../utils/constants'

// Pass in the merged table that includes Homer and summed appliance calculated columnms.
// Also pass in adjustable fields from store that are required
// to do the calculations
export function calcHybridColumns(grid, summedAppliances) {
  if (_.isEmpty(grid) || _.isEmpty(grid.fileData) || _.isEmpty(summedAppliances)) {
    return []
  }
  const { batteryMinEnergyContent, batteryMaxEnergyContent } = grid

  // Reducer function. This is needed so that we can have access to values in
  // rows we previously calculated
  const columnReducer = (result, homerRow, rowIndex, homerRows) => {
    // Get the matching row for the appliance
    const applianceRow = summedAppliances[rowIndex]

    // Get the previous row from the calculated results (the reason for the reduce function)
    const prevResult = rowIndex === 0 ? {} : result[rowIndex - 1]

    // Calculated (summed) loads from new enabled appliances
    const newAppliancesLoad = applianceRow['newAppliancesLoad']
    const totalElectricalProduction = homerRow['totalElectricalProduction']

    // const { powerType: gridPowerType } = getGridPowerType(_.keys(homerRow))

    // 'Load Served' implies it was actually served, instead of load demand.
    // We want to predict the battery energy content, unmet load and excess production.
    // Unmet load implies what would have been served if there was available production
    // or battery energy content. In reality, there is no difference between
    // 'load served' and just 'load' because if the grid goes down, there is no load.
    // However, the prediction function calculates battery energy content, excess
    // production and unmet load at the same time.

    // const originalElectricLoad =
    //   gridPowerType === 'AC' ? homerRow['AC Primary Load'] : homerRow['DC Primary Load']

    const originalElectricLoadServed = homerRow['Original Electrical Load Served']

    // The underlying assumption is that we have a generator backup, so it will always be served
    const totalElectricalLoadServed =
      // originalElectricLoad + newAppliancesLoad + applianceRow['newAppliancesAncillaryLoad']  // Temp
      originalElectricLoadServed + newAppliancesLoad + applianceRow['newAppliancesAncillaryLoad']

    // This value is important for predicting the battery energy content based on new loads
    // It's positive if battery is charging, negative if battery is discharging
    const electricalProductionLoadDiff = totalElectricalProduction - totalElectricalLoadServed

    // __ Predict Battery Energy Content _______________________________________
    // Predict battery energy content based on new appliance loads.
    // During prediction, we can calculate new unmet load and new excess production.
    // Prediction depends on electricalProductionLoadDiff and the previous battery
    // energy content. Battery content is clamped by the min and max of the battery.
    const prevBatteryEnergyContent =
      rowIndex === 0 ? homerRow['originalBatteryEnergyContent'] : prevResult['batteryEnergyContent']

    const {
      batteryEnergyContent,
      totalExcessProduction,
      totalUnmetLoad,
    } = predictBatteryEnergyContent({
      rowIndex,
      prevBatteryEnergyContent,
      electricalProductionLoadDiff,
      batteryMinEnergyContent,
      batteryMaxEnergyContent,
    })

    // _________________________________________________________________________
    // __ Unmet Load ___________________________________________________________
    // _________________________________________________________________________
    // Some of these numbers from HOMER are -1x10-16. Rounding makes them reasonable
    const originalUnmetLoad = homerRow['Original Unmet Electrical Load']
    const originalModeledUnmetLoad = homerRow['originalModeledUnmetLoad']
    const originalModeledUnmetLoadCount =
      _.round(originalModeledUnmetLoad, unmetLoadRoundingDecimals) > 0 ? 1 : 0

    //  We know: original + newAppliances = total
    //  Therefore: newAppliances = total - original
    // Given the same production capacity, the unmet load with a new appliance should
    // always be higher than the original unmet load. Due to imperfect battery model,
    // occasionally total unmet load is slightly less than our original unmet load,
    // which should never happen in real life. That gives a negative newAppliancesUnmetLoad
    // So clamp it to zero if negative.
    const newAppliancesUnmetLoad =
      totalUnmetLoad - originalModeledUnmetLoad < 0 // top clamp: accounts for imperfect predictions
        ? 0
        : totalUnmetLoad - originalModeledUnmetLoad

    const totalUnmetLoadCount = _.round(totalUnmetLoad, unmetLoadRoundingDecimals) > 0 ? 1 : 0

    // totalUnmetLoadCount should always be greater than originalModeledUnmetLoadCount
    // since a new appliance will increase the unmet load count
    const newAppliancesUnmetLoadCount = totalUnmetLoadCount - originalModeledUnmetLoadCount

    // _________________________________________________________________________
    // __ Excess Production _______________________________________________________
    // _________________________________________________________________________
    // Approach excess production like unmet load above
    const originalExcessProduction = homerRow['Original Excess Electrical Production']
    const originalModeledExcessProduction = homerRow['originalModeledExcessProduction']
    const originalModeledExcessProductionCount =
      _.round(originalModeledExcessProduction, excessProductionRoundingDecimals) > 0 ? 1 : 0

    // 'original' should always be greater than or equal to the new total, since
    // new appliances will reduce the excess capacity.
    // newAppliancesExcessProduction, totalExcessProduction & originalModeledExcessProduction
    // are always positive.
    // Since totalExcessProduction is based on the battery prediction model, it makes
    // more sense to use the originalModeledExcessProduction to calculate the excess
    // due to new appliances.
    const newAppliancesExcessProduction =
      totalExcessProduction - originalModeledExcessProduction > 0
        ? 0
        : totalExcessProduction - originalModeledExcessProduction

    const totalExcessProductionCount =
      _.round(totalExcessProduction, excessProductionRoundingDecimals) > 0 ? 1 : 0

    // Original should always be higher than total since new appliances decrease excess production
    // newAppliancesExcessProductionCount will be negative
    const newAppliancesExcessProductionCount =
      totalExcessProductionCount - originalModeledExcessProductionCount

    // __ Output Results _______________________________________________________
    // I think availableCapacity doesn't make sense to calculate or display.
    // Available capacity is used to charge the battery, so you can never really
    // know if it's actuall available, unless you had a much better model of the
    // battery. Excess production is clear though - the battery is fully charged
    // and there is still excess production that could be used.
    result.push({
      hour: homerRow['hour'],
      datetime: homerRow['Time'],
      hourOfDay: applianceRow['hourOfDay'],
      dayOfWeek: applianceRow['dayOfWeek'],
      hourOfWeek: applianceRow['hourOfWeek'],
      newAppliancesLoad: _.round(newAppliancesLoad, 4),
      batteryEnergyContent: _.round(batteryEnergyContent, 4),
      totalElectricalProduction: _.round(totalElectricalProduction, 4),

      // originalElectricLoad: _.round(originalElectricLoad, 4), // I don't think we need it
      totalElectricalLoadServed: _.round(totalElectricalLoadServed, 4),
      originalElectricLoadServed: _.round(originalElectricLoadServed, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),

      // See note in README.md about how many decimal places to round unmet load
      originalUnmetLoad: _.round(originalUnmetLoad, 1),
      originalModeledUnmetLoad: _.round(originalModeledUnmetLoad, 1),
      originalModeledUnmetLoadCount,
      newAppliancesUnmetLoad: _.round(newAppliancesUnmetLoad, 1),
      newAppliancesUnmetLoadCount,
      totalUnmetLoad: _.round(totalUnmetLoad, 1),
      totalUnmetLoadCount,

      // Excess Load
      originalExcessProduction: _.round(originalExcessProduction, 4),
      originalModeledExcessProductionCount,
      newAppliancesExcessProduction: _.round(newAppliancesExcessProduction, 4),
      newAppliancesExcessProductionCount,
      totalExcessProduction: _.round(totalExcessProduction, 4),
      totalExcessProductionCount,
    })
    return result
  }

  // Iterate over homer data, pushing each new row into an array
  return _.reduce(grid.fileData, columnReducer, [])
}
