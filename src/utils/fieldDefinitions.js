const jsonSchemaStandard = 'http://json-schema.org/draft-04/schema#'

// These are just example schemas to test the input component
// Every appliance will have it's own set as well as an app-wide set

// Will be converted to typescript types:
// https://spin.atomicobject.com/2018/03/26/typescript-data-validation/

export const fieldDefinitions = {
  kwFactorToKw: {
    $schema: jsonSchemaStandard,
    title: 'Usage Factor to kW',
    description:
      'Apply the appliance nominal power (in kW) to determine the load profile for this appliance',
    type: 'float',
    minimum: 0,
    maximum: 2,
    step: 0.1,
    defaultValue: 0.5,
    units: '-',
  },

  dutyCycleDerateFactor: {
    $schema: jsonSchemaStandard,
    title: 'Duty Cycle Derate Factor',
    description:
      "A welder, for example, may only run 20% within a 2 minute measured interval. In that case, enter 0.2. If an appliance is running for it's full 2 minute interval, enter 1",
    type: 'float',
    minimum: 0,
    maximum: 2,
    step: 0.05,
    defaultValue: 1,
    units: '-',
  },

  wholesaleElectricityCost: {
    $schema: jsonSchemaStandard,
    title: 'Wholesale Electricity Cost',
    description:
      'Cost to produce or purchase electricity for the grid operator, not including unmet load costs.',
    type: 'float',
    // minimum: 0,
    // maximum: 2,
    // step: 0.05,
    defaultValue: 5,
    units: '$/kWh',
  },

  unmetLoadCostPerKwh: {
    $schema: jsonSchemaStandard,
    title: 'Unmet Load Electricity Cost',
    description:
      'Cost to produce or purchase electricity for the grid operator, above what their system can handle. For example, this may be the cost of diesel for a generator',
    type: 'float',
    defaultValue: 6,
    units: '$/kWh',
  },

  retailElectricityPrice: {
    $schema: jsonSchemaStandard,
    title: 'Retail Electricity Price',
    description:
      'Price of electricity for the consumer (appliance operator). This is also the revenue for the grid operator.',
    type: 'float',
    defaultValue: 8,
    units: '$/kWh',
  },

  productionToThroughput: {
    $schema: jsonSchemaStandard,
    title: 'Production Factor to Throughput',
    description:
      'Given utilization of the appliance (production factor), how much grain is milled, water pumped or material is welded.',
    type: 'float',
    defaultValue: 1,
    units: '-',
  },

  throughputToRevenue: {
    $schema: jsonSchemaStandard,
    title: 'Throughput to Revenue',
    description:
      'Given a unit of throughput (kg of grain, for example), what revenue is generated?',
    type: 'float',
    defaultValue: 1,
    units: '-',
  },

  throughputToRevenueUnits: {
    $schema: jsonSchemaStandard,
    title: 'Throughput to Revenue',
    type: 'array',
    values: ['$ / kg of grain', '$ / hour', '$ / liter'],
    defaultValue: '-',
    units: '-',
  },

  // Example with min and max, which is editable
  // grainThroughput: {
  //   $schema: jsonSchemaStandard,
  //   title: 'Grain Mill Throughput',
  //   type: 'integer', // Should this be 'number' for typescript?
  //   minimum: 200,
  //   maximum: 400,
  //   step: 10,
  //   defaultValue: 300,
  //   units: 'kg/hour',
  // },

  // Example with no min and max, so this is not editable
  // nominalAppliancePower: {
  //   $schema: jsonSchemaStandard,
  //   title: 'Nominal Appliance Power',
  //   subtitle: 'some subtitle',
  //   type: 'integer',
  //   defaultValue: 6000,
  //   unit: 'W',
  // },

  // Smaller steps
  // nominalMotorVoltage: {
  //   $schema: jsonSchemaStandard,
  //   title: 'Nominal Motor Voltage',
  //   type: 'integer',
  //   minimum: 200,
  //   maximum: 280,
  //   step: 1,
  //   defaultValue: 240,
  //   precision: 0, // If we have a precision of 0, does that defined an integer
  //   unit: 'Volts',
  // },

  // One possible key is isConstant = true, which will make the field non-editable
}
