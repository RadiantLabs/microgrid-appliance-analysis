const jsonSchemaStandard = 'http://json-schema.org/draft-04/schema#'

// These are just example schemas to test the input component
// Every appliance will have it's own set as well as an app-wide set

// Will be converted to typescript types:
// https://spin.atomicobject.com/2018/03/26/typescript-data-validation/

export const fieldDefinitions = {
  label: {
    $schema: jsonSchemaStandard,
    title: 'File Label',
    description:
      'By default, this is the name of the uploaded file, but you can name it whatever you want.',
    type: 'string',
  },
  description: {
    $schema: jsonSchemaStandard,
    title: 'File Description',
    description: 'This is a description for your records',
    type: 'string',
  },
  capex: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Capex',
    description: 'Capital expenditure for the appliance',
    type: 'integer',
    units: '$',
  },
  capexAssignment: {
    $schema: jsonSchemaStandard,
    title: 'Capex Assignment',
    description:
      'This determines who (grid owner or appliance owner) pays for the up-front capex investment.',
    type: 'enumeration',
    enumerations: ['grid', 'appliance'],
    units: '-',
  },
  estimatedCapex: {
    $schema: jsonSchemaStandard,
    title: 'Estimated Capex',
    description:
      'Estimated cost of equipment based on appliance size and other attributes. This is overridable by the user.',
    type: 'integer',
    units: '$',
  },
  nominalPower: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Nominal Power',
    description:
      'Apply the appliance nominal power (in kW) to determine the load profile for this appliance',
    type: 'float',
    minimum: 0,
    maximum: 100,
    step: 0.1,
    // defaultValue: 2.2,
    units: 'kW',
  },
  powerFactor: {
    $schema: jsonSchemaStandard,
    title: 'Power Factor',
    description:
      'The power factor of the appliance, between 0 and 1. A purely resistive circuit is 1. A purely inductive current is 0.',
    type: 'float',
    minimum: 0,
    maximum: 1,
    units: '-',
  },
  powerType: {
    $schema: jsonSchemaStandard,
    title: 'Power Type',
    description: 'Options are alternating current (AC) or direct current (DC)',
    type: 'enumeration',
    enumerations: ['AC', 'DC'],
    units: '-',
  },
  phase: {
    $schema: jsonSchemaStandard,
    title: 'Phase',
    description: 'Options are 1-phase, 2-phase or 3-phase system',
    type: 'enumeration',
    enumerations: [1, 2, 3],
    units: '-',
  },
  hasMotor: {
    $schema: jsonSchemaStandard,
    title: 'Has Motor?',
    description: 'Does the appliance have a motor?',
    type: 'enumeration',
    enumerations: [true, false],
    units: '-',
  },
  dutyCycleDerateFactor: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Duty Cycle Derate Factor',
    description:
      'A welder, for example, may only run 20% within a 2 minute measured interval. In that case, enter 0.2. Mills likely run for the entire 2 minute measured interval, so would have a value of 1',
    type: 'float',
    minimum: 0,
    maximum: 2,
    step: 0.05,
    // defaultValue: 1,
    units: '-',
  },
  wholesaleElectricityCost: {
    $schema: jsonSchemaStandard,
    title: 'Wholesale Electricity Cost (if grid-tied)',
    description:
      'Cost to produce or purchase electricity for the grid operator, not including unmet load costs.',
    type: 'float',
    // defaultValue: 0,
    units: '$/kWh',
  },
  unmetLoadCostPerKwh: {
    $schema: jsonSchemaStandard,
    title: 'Unmet Load Electricity Cost',
    description:
      'Cost to produce or purchase electricity for the grid operator, above what their system can handle. For example, this may be the cost of diesel for a generator',
    type: 'float',
    // defaultValue: 0.35,
    units: '$/kWh',
  },
  retailElectricityPrice: {
    $schema: jsonSchemaStandard,
    title: 'Retail Electricity Price',
    description:
      'Price of electricity for the consumer (appliance operator). This is also the revenue for the grid operator.',
    type: 'float',
    // defaultValue: 0.45,
    units: '$/kWh',
  },
  productionUnitType: {
    $schema: jsonSchemaStandard,
    title: 'Production Unit Type',
    description:
      'The type of "units" we are producing. Could be something like kg, hour, or liters.',
    type: 'string',
    // defaultValue: '',
  },
  productionUnitsPerKwh: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Units of Production per kWh',
    description:
      'How many units can be produced for a single kwh. Multiply by yearly kWh to get number of units produced in a year. Units could be kg grain / kWh.',
    type: 'float',
    // defaultValue: 136,
    units: 'productionUnitType/kWh',
  },
  revenuePerProductionUnits: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Revenue Per Production Units',
    description:
      'Revenue generated per unit of production. For example, multiply by yearly kg of grain to get yearly revenue: $ / kg of grain milled.',
    type: 'float',
    // defaultValue: 0.021,
    units: '$/productionUnitType',
  },
  equipmentSize: {
    $schema: jsonSchemaStandard,
    title: 'Ancillary Equipment Size',
    description:
      "Size of ancillary equipment needs to more than cover the appliance's nominal appliance power.",
    type: 'float',
    units: 'kW',
  },
  efficiencyRating: {
    $schema: jsonSchemaStandard,
    title: 'Efficiency Rating',
    description: 'Efficiency Rating of the Equipment, between 0 and 1.',
    minimum: 0,
    maximum: 1,
    type: 'float',
    units: 'kW',
  },
  estimatedEfficiency: {
    $schema: jsonSchemaStandard,
    title: 'Estimated Efficiency',
    description:
      'Estimated cost of equipment based on appliance size and other attributes. This is overridable by the user.',
    type: 'integer',
    units: '$',
  },
  pvType: {
    $schema: jsonSchemaStandard,
    title: 'PV Type',
    type: 'string',
  },
  generatorType: {
    $schema: jsonSchemaStandard,
    title: 'Generator Type',
    type: 'string',
  },
  batteryType: {
    $schema: jsonSchemaStandard,
    title: 'Battery Type',
  },
  batteryMinEnergyContent: {
    $schema: jsonSchemaStandard,
    title: 'Battery Min Energy Content',
    type: 'float',
    units: 'kWh',
  },
  batteryEstimatedMinEnergyContent: {
    $schema: jsonSchemaStandard,
    title: 'Estimated Battery Min Energy Content',
    description: 'Calculated by looking at average mininum values in the HOMER file.',
    type: 'float',
    units: 'kWh',
  },
  batteryMaxEnergyContent: {
    $schema: jsonSchemaStandard,
    title: 'Battery Max Energy Content',
    type: 'float',
    units: 'kWh',
  },
  batteryEstimatedMaxEnergyContent: {
    $schema: jsonSchemaStandard,
    title: 'Estimated Battery Max Energy Content',
    description: 'Calculated by looking at average maximum values in the HOMER file.',
    type: 'float',
    units: 'kWh',
  },
  applianceType: {
    $schema: jsonSchemaStandard,
    title: 'Appliance Type',
    description:
      'Simple, broad classification of the type of appliance this is. Use existing classifications or add your own.',
    type: 'enumeration',
    enumerations: ['rice_mill', 'maize_mill', 'water_pump', 'welder', 'other', ''],
  },
  equipmentType: {
    $schema: jsonSchemaStandard,
    title: 'Ancillary Equipment Type',
    description: 'Short description of the ancillary equipment, used internally in the code',
    type: 'enumeration',
    enumerations: [
      'powerConverter',
      'inverter',
      'vfd',
      'softStarter',
      'directOnlineStarter',
      'starDeltaStarter',
      'capacitorBank',
      'threeFourPointDcMotorStarter',
    ],
  },
  compatibility: {
    $schema: jsonSchemaStandard,
    title: 'Ancillary Equipment Compatibility',
    description:
      'Code that deterimines if ancillary equipment is compatible with a paired appliance',
    type: 'enumeration',
    enumerations: ['required', 'useful', 'notuseful'],
  },
  compatibilityMessage: {
    $schema: jsonSchemaStandard,
    title: 'Ancillary Equipment Compatibility Message',
    description:
      'A message that is generated by a rule system, based on a paired ancillary equipment and appliance.',
    type: 'string',
  },
  newExcessProduction: {
    $schema: jsonSchemaStandard,
    title: 'New Excess Production',
    description:
      'Excess production that includes the original HOMER production minus new appliance loads',
    type: 'float',
    units: 'kWh',
  },
  batteryEnergyContent: {
    $schema: jsonSchemaStandard,
    title: 'Battery Energy Content',
    description: 'Energy content of the battery including new appliance loads',
    type: 'float',
    units: 'kWh',
  },
  totalUnmetLoad: {
    $schema: jsonSchemaStandard,
    title: 'New Unmet Load',
    description:
      'Unmet load, which includes the original HOMER unmet loads and additional unmet loads due to new appliances.',
    type: 'float',
    units: 'kWh',
  },
}
