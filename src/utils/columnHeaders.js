import _ from 'lodash'

// Set column order and units for the datatable
export const hybridColumnHeaderUnits = [
  ['hour', '-'],
  ['datetime', '-'],
  ['hour_of_day', '-'],
  // ['day_hour', '-'],
  ['totalElectricalLoadServed', 'kW'],
  ['electricalProductionLoadDiff', 'kW'],
  // ['newAppliancesLoad', 'kW'],
  ['availableCapacity', 'kW'],
  ['availableCapacityAfterNewLoad', 'kW'],
  ['batteryEnergyContent', 'kWh'],
  ['originalUnmetLoad', 'kW'],
  ['additionalUnmetLoad', 'kW'],
  ['newUnmetLoad', 'kW'],
  ['newExcessProduction', 'kW'],
]

export const homerHeaderUnits = [
  ['Global Solar', 'kW/m2'],
  ['PV Solar Altitude', 'Â°'],
  ['PV Solar Azimuth', 'Â°'],
  ['PV Angle of Incidence', 'Â°'],
  ['PV Incident Solar', 'kW/m2'],
  ['PV Power Output', 'kW'],
  ['AC Primary Load', 'kW'],
  ['AC Primary Load Served', 'kW'],
  ['Original Electrical Load Served', 'kW'],
  ['Renewable Penetration', '%'],
  ['Original Excess Electrical Production', 'kW'],
  ['Capacity Shortage', 'kW'],
  ['Total Renewable Power Output', 'kW'],
  ['totalElectricalProduction', 'kW'],
  ['originalElectricalProductionLoadDiff', 'kW'],
  ['originalBatteryEnergyContent', 'kWh'],
  ['originalModeledBatteryEnergyContent', 'kWh'],
  ['Inverter Power Input', 'kW'],
  ['Inverter Power Output', 'kW'],
  ['Rectifier Power Input', 'kW'],
  ['Rectifier Power Output', 'kW'],
  ['Original Battery Maximum Charge Power', 'kW'],
  ['Original Battery Maximum Discharge Power', 'kW'],
  ['Original Battery Charge Power', 'kW'],
  ['Original Battery Discharge Power', 'kW'],
  ['Original Battery Input Power', 'kW'],
  ['Original Battery State of Charge', '%'],
  ['Original Battery Energy Cost', '$/kWh'],
  ['Original Battery Temperature', 'C'],
  ['Original Battery Degradation - Time and Temperature', '%'],
  ['Original Battery Degradation - Cycling', '%'],
  ['Original Battery Equivalent Cycles', 'cycles'],
  ['AC Required Operating Capacity', 'kW'],
  ['DC Required Operating Capacity', 'kW'],
  ['AC Operating Capacity', 'kW'],
  ['DC Operating Capacity', 'kW'],
]
export const applianceHeaderUnits = [
  ['newAppliancesLoad', 'kW'],
  ['newAppliancesAncillaryLoad', 'kW'],
  ['productionUnitsRevenue', '$'],
  ['day_hour', '-'],
  ['kw_factor', '-'],
]

// Export array of columnn headers. This is to allow defining column order
const combinedColumns = hybridColumnHeaderUnits.concat(homerHeaderUnits, applianceHeaderUnits)
export const combinedColumnHeaderOrder = _.map(combinedColumns, columnPair => {
  return _.first(columnPair)
})

// Export object that maps units of the columns to the column header name.
// This is used in the datatable
export const combinedColumnHeaderUnits = _.fromPairs(combinedColumns)

// Export an object that maps the column header name to the table type. This can
// be used to color the columns based on table type. This is done for very fast lookup
const hybridColumnTypes = _(hybridColumnHeaderUnits)
  .fromPairs()
  .mapValues(val => 'hybridColumns')
  .value()
const homerColumnTypes = _(homerHeaderUnits)
  .fromPairs()
  .mapValues(val => 'homer')
  .value()
const applianceColumnTypes = _(applianceHeaderUnits)
  .fromPairs()
  .mapValues(val => 'appliance')
  .value()

export const columnHeaderByTableType = {
  ...hybridColumnTypes,
  ...homerColumnTypes,
  ...applianceColumnTypes,
}
