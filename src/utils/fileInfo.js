// HOMER Files
export const homerFiles = [
  {
    type: 'homer',
    label: '12-50 Baseline',
    path: './data/homer/12-50 Baseline.csv',
    description: 'Baseline: Fill in HOMER file description.',
    attributes: {
      battery: 'Generic 1kWh Lead Acid [ASM]',
      pvSystem: 'Generic flat plate',
      powerType: 'AC',
    },
  },
  {
    type: 'homer',
    label: '12-50 Oversize 20',
    path: './data/homer/12-50 Oversize 20.csv',
    description: 'Oversized: Fill in HOMER file description.',
    attributes: {
      battery: 'Generic 1kWh Lead Acid [ASM]',
      pvSystem: 'Generic flat plate',
      powerType: 'AC',
    },
  },
  {
    type: 'homer',
    label: '12-50 Undersize 20',
    path: './data/homer/12-50 Undersize 20.csv',
    description: 'Undersized: Fill in HOMER file description.',
    attributes: {
      battery: 'Generic 1kWh Lead Acid [ASM]',
      pvSystem: 'Generic flat plate',
      powerType: 'AC',
    },
  },
  {
    type: 'homer',
    label: '12-50 Undersize 20 AS',
    path: './data/homer/homer_12_50_oversize_20_AS.csv',
    description: 'Undersized: Fill in HOMER file description.',
    attributes: {
      battery: 'Generic 1kWh Lead Acid [ASM]',
      pvSystem: 'Generic flat plate',
      powerType: 'AC',
    },
  },
]

// Primary appliances
export const applianceFiles = [
  {
    type: 'appliance',
    applianceType: 'rice_mill',
    label: 'Rice Mill (Tanzania)',
    path: './data/appliances/rice_mill_usage_profile.csv',
    description: 'Rice mill usage profile from downloaded UTC file usage (Tanzania)',
    attributes: {
      powerType: 'AC',
      phase: 3,
      hasMotor: true,
      powerFactor: 0.8,
    },
  },
  {
    type: 'appliance',
    applianceType: 'maize_mill',
    label: 'Maize Mill (Tanzania)',
    path: './data/appliances/maize_mill_usage_profile_1.csv',
    description: 'Maize mill usage profile (1) from downloaded UTC file (Tanzania)',
    attributes: {
      powerType: 'AC',
      phase: 3,
      hasMotor: true,
      powerFactor: 0.8,
    },
  },
  {
    type: 'appliance',
    applianceType: 'maize_mill',
    label: 'Maize Mill (Tanzania)',
    path: './data/appliances/maize_mill_usage_profile_2.csv',
    description: 'Maize mill usage profile (2) from downloaded UTC sensor file (Tanzania)',
    attributes: {
      powerType: 'AC',
      phase: 3,
      hasMotor: true,
      powerFactor: 0.8,
    },
  },
  {
    type: 'appliance',
    applianceType: 'welder',
    label: 'Welder (Tanzania)',
    path: './data/appliances/welder_usage_profile.csv',
    description: 'Welder usage profile from downloaded UTC sensor file (Tanzania)',
    defaults: {
      dutyCycleDerateFactor: 0.2,
    },
    attributes: {
      powerType: 'AC',
      phase: 3,
      hasMotor: false,
      powerFactor: 1,
    },
  },
]

// Ancillary Equipment
export const ancillaryEquipment = [
  {
    equipmentType: 'power_converter',
    label: 'Power Converter',
    description:
      'A power converter is a pluggable piece of equipment that converts AC power to DC power. An example may be converting AC grid electricity to power a fan driven by a DC motor',
  },
  {
    equipmentType: 'inverter',
    label: 'Inverter',
    description:
      'An inverter is a pluggable piece of equipment that converts DC power to AC power. An example may be converting DC power from a battery to electrify an AC powered printer.',
  },
  {
    equipmentType: 'vfd',
    label: 'VFD',
    description: 'Variable Frequency Drive',
  },
  {
    equipmentType: 'soft_starter',
    label: 'Soft Starter',
    description: 'TODO',
  },
  {
    equipmentType: 'direct_online_starter',
    label: 'Direct On-line Starter',
    description: 'TODO',
  },
  {
    equipmentType: 'star_delta_starter',
    label: 'Star Delta Starter',
    description: 'TODO',
  },
  {
    equipmentType: 'capacitor_bank',
    label: 'Capacitor Bank',
    description: 'TODO',
  },
  {
    equipmentType: 'three_four_point_dc_motor_starter',
    label: 'Three/Four Point DC Motor Starter',
    description: 'TODO',
  },
]

// TODO: do I put logic in a DSL or in code?
// Maybe I start with code and as I understand the use cases, migrate it to a DSL?
// Here is an example of a DSL.
// 1. How do I encode messages?
// 2. How do I do chained conditional logic? If a is true and b is false, then if x true, return 'foo', else return 'bar'
// compatibility: {
//   requiredIfDifferent: [
//     // If appliance is DC and grid is AC, this is required
//     {
//       match: { appliancePowerType: 'DC', gridPowerType: 'AC' },
//       messageIfTrue:
//         'A power converter is required hardware for successful appliance operation',
//       messageIfFalse:
//         'A power converter may not be useful. A power converter may be useful if the supply power is AC and the appliance is designed to receive DC power.',
//     },
//   ],
//   // There may be a case where the equipment is required if 2 attributes are the same
//   requiredIfSame: [],
//   compatibleIfDifferent: [],
//   compatibleIfSame: [],
// },
