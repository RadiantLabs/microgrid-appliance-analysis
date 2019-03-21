import _ from 'lodash'

// TODO: This could all be done dynamically with computed values, removing
// the columns I don't want
export const hybridColumnHeaders = [
  'hour',
  'datetime',
  'hour_of_day',
  // 'day_hour',
  'totalElectricalProduction',
  'originalElectricalProductionLoadDiff',
  'electricalProductionLoadDiff',
  'totalElectricalLoadServed',
  // 'prevBatteryEnergyContent',
  'originalBatteryEnergyContent',
  // 'newAppliancesLoad',
  'availableCapacity',
  'availableCapacityAfterNewLoad',
  'additionalUnmetLoad',

  'newApplianceBatteryConsumption',
  'originalBatteryEnergyContentDelta',
  'newApplianceBatteryEnergyContent',
  'tempBatteryEnergyContent',

  'originalUnmetLoad',
  'newTotalUnmetLoad',
]

export const hybridColumnHeaderUnits = {
  hour: '-',
  datetime: '-',
  hour_of_day: '-',
  // day_hour: '-',
  totalElectricalProduction: 'kW',
  originalElectricalProductionLoadDiff: 'kW',
  totalElectricalLoadServed: 'kW',
  electricalProductionLoadDiff: 'kW',
  // prevBatteryEnergyContent: 'kWh',
  originalBatteryEnergyContent: 'kWh',
  // newAppliancesLoad: 'kW',
  availableCapacity: 'kW',
  availableCapacityAfterNewLoad: 'kW',
  additionalUnmetLoad: 'kW',
  newApplianceBatteryConsumption: 'kW',
  originalBatteryEnergyContentDelta: 'kWh',
  newApplianceBatteryEnergyContent: 'kWh',
  tempBatteryEnergyContent: 'kW',

  originalUnmetLoad: 'kW',
  newTotalUnmetLoad: 'kW',
}

export const homerHeaders = [
  // 'Time',
  'Global Solar',
  'PV Solar Altitude',
  'PV Solar Azimuth',
  'PV Angle of Incidence',
  'PV Incident Solar',
  'PV Power Output',
  'AC Primary Load',
  'AC Primary Load Served',
  'Total Electrical Load Served',
  'Renewable Penetration',
  'Excess Electrical Production',
  'Unmet Electrical Load',
  'Capacity Shortage',
  'Total Renewable Power Output',
  'Inverter Power Input',
  'Inverter Power Output',
  'Rectifier Power Input',
  'Rectifier Power Output',
  'Original Battery Maximum Charge Power',
  'Original Battery Maximum Discharge Power',
  'Original Battery Charge Power',
  'Original Battery Discharge Power',
  'Original Battery Input Power',
  'Original Battery Energy Content',
  'Original Battery State of Charge',
  'Original Battery Energy Cost',
  'Original Battery Temperature',
  'Original Battery Degradation - Time and Temperature',
  'Original Battery Degradation - Cycling',
  'Original Battery Equivalent Cycles',
  'AC Required Operating Capacity',
  'DC Required Operating Capacity',
  'AC Operating Capacity',
  'DC Operating Capacity',
  // 'hour',
]

export const homerHeaderUnits = {
  // 'Time': '-',
  'Global Solar': 'kW/m2',
  'PV Solar Altitude': 'Â°',
  'PV Solar Azimuth': 'Â°',
  'PV Angle of Incidence': 'Â°',
  'PV Incident Solar': 'kW/m2',
  'PV Power Output': 'kW',
  'AC Primary Load': 'kW',
  'AC Primary Load Served': 'kW',
  'Total Electrical Load Served': 'kW',
  'Renewable Penetration': '%',
  'Excess Electrical Production': 'kW',
  'Unmet Electrical Load': 'kW',
  'Capacity Shortage': 'kW',
  'Total Renewable Power Output': 'kW',
  'Inverter Power Input': 'kW',
  'Inverter Power Output': 'kW',
  'Rectifier Power Input': 'kW',
  'Rectifier Power Output': 'kW',
  'Battery Maximum Charge Power': 'kW',
  'Battery Maximum Discharge Power': 'kW',
  'Battery Charge Power': 'kW',
  'Battery Discharge Power': 'kW',
  'Battery Input Power': 'kW',
  'Original Battery Energy Content': 'kW',
  'Battery State of Charge': '%',
  'Battery Energy Cost': '$/kWh',
  'Battery Temperature': 'C',
  'Battery Degradation - Time and Temperature': '%',
  'Battery Degradation - Cycling': '%',
  'Battery Equivalent Cycles': 'cycles',
  'AC Required Operating Capacity': 'kW',
  'DC Required Operating Capacity': 'kW',
  'AC Operating Capacity': 'kW',
  'DC Operating Capacity': 'kW',
  // 'hour',
}

export const applianceHeaders = [
  'newAppliancesLoad',
  'productionUnitsRevenue',
  // 'datetime',
  // 'hour',
  // 'day',
  // 'hour_of_day',
  'day_hour',
  'kw_factor',
  // 'production_factor',
]

export const applianceHeaderUnits = {
  newAppliancesLoad: 'kW',
  productionUnitsRevenue: '$',
  // 'datetime',
  // 'hour',
  // 'day',
  // 'hour_of_day',
  day_hour: '-',
  kw_factor: '-',
  // 'production_factor',
}

export const combinedColumnHeaderOrder = hybridColumnHeaders.concat(homerHeaders, applianceHeaders)

export const combinedColumnHeaderUnits = {
  ...hybridColumnHeaderUnits,
  ...homerHeaderUnits,
  ...applianceHeaderUnits,
}

export function setColumnHeaderTableType(hybridColumnHeaders, homerHeaders, applianceHeaders) {
  const hybridColumns = _.reduce(
    hybridColumnHeaders,
    (result, header) => {
      result[header] = 'hybridColumns'
      return result
    },
    {}
  )
  const homer = _.reduce(
    homerHeaders,
    (result, header) => {
      result[header] = 'homer'
      return result
    },
    {}
  )
  const appliance = _.reduce(
    applianceHeaders,
    (result, header) => {
      result[header] = 'appliance'
      return result
    },
    {}
  )
  return {
    ...hybridColumns,
    ...homer,
    ...appliance,
  }
}

export const columnHeaderByTableType = setColumnHeaderTableType(
  hybridColumnHeaders,
  homerHeaders,
  applianceHeaders
)
