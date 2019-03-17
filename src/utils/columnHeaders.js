import _ from 'lodash'

// TODO: This could all be done dynamically with computed values, removing
// the columns I don't want
export const calculatedColumnHeaders = [
  'hour',
  'datetime',
  'hour_of_day',
  'day',
  'day_hour',
  'totalElectricalProduction',
  'electricalProductionLoadDiff',
  'prevBatterySOC',
  'prevBatteryEnergyContent',
  'newAppliancesLoad',
  'availableCapacity',
  'availableCapacityAfterNewLoad',
  'additionalUnmetLoad',
  'newApplianceBatteryConsumption',
  'originalBatteryEnergyContentDelta',
  'newApplianceBatteryEnergyContent',
  'originalUnmetLoad',
  'newTotalUnmetLoad',
]

export const calculatedColumnHeaderUnits = {
  hour: '-',
  datetime: '-',
  hour_of_day: '-',
  day: '-',
  day_hour: '-',
  totalElectricalProduction: 'kW',
  electricalProductionLoadDiff: 'kW',
  prevBatterySOC: '%',
  prevBatteryEnergyContent: 'kWh',
  newAppliancesLoad: 'kW',
  availableCapacity: 'kW',
  availableCapacityAfterNewLoad: 'kW',
  additionalUnmetLoad: 'kW',
  newApplianceBatteryConsumption: 'kW',
  originalBatteryEnergyContentDelta: 'kWh',
  newApplianceBatteryEnergyContent: 'kWh',
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
  'Battery Maximum Charge Power',
  'Battery Maximum Discharge Power',
  'Battery Charge Power',
  'Battery Discharge Power',
  'Battery Input Power',
  'Battery Energy Content',
  'Battery State of Charge',
  'Battery Energy Cost',
  'Battery Temperature',
  'Battery Degradation - Time and Temperature',
  'Battery Degradation - Cycling',
  'Battery Equivalent Cycles',
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
  'Battery Energy Content': 'kW',
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
  // 'datetime',
  // 'hour',
  // 'day',
  // 'hour_of_day',
  // 'day_hour',
  'kw_factor',
  // 'production_factor',
]

export const applianceHeaderUnits = {
  // 'datetime',
  // 'hour',
  // 'day',
  // 'hour_of_day',
  // 'day_hour',
  kw_factor: '-',
  // 'production_factor',
}

export const combinedColumnHeaderOrder = calculatedColumnHeaders.concat(
  homerHeaders,
  applianceHeaders
)

export const combinedColumnHeaderUnits = {
  ...calculatedColumnHeaderUnits,
  ...homerHeaderUnits,
  ...applianceHeaderUnits,
}

export function setColumnHeaderTableType(calculatedColumnHeaders, homerHeaders, applianceHeaders) {
  const hybridColumns = _.reduce(
    calculatedColumnHeaders,
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
  calculatedColumnHeaders,
  homerHeaders,
  applianceHeaders
)
