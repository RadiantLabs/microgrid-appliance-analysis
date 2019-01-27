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
      powerType: 'DC',
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
    equipmentType: 'powerConverter',
    label: 'AC to DC Power Converter',
    description:
      'A power converter converts AC power to DC power. An example may be converting AC grid electricity to power a fan driven by a DC motor',
  },
  {
    equipmentType: 'inverter',
    label: 'DC to AC Inverter',
    description:
      'An inverter converts DC power to AC power. An example may be converting DC power from a battery to electrify an AC powered printer.',
  },
  {
    equipmentType: 'vfd',
    label: 'Variable Frequency Drive',
    description:
      'A variable frequency drive provides AC three phase frequency variation for motor speed control, reduction of starting torque, and inrush current relief. An example may be a VFD upstream of an industrial blower to control flow rates depending on operational conditions.',
  },
  {
    equipmentType: 'softStarter',
    label: 'Soft Starter',
    description:
      'A softstarter slowly ramps up AC voltage when starting a motor to reduce starting torque and provide inrush current relief. An example may be a softstarter upstream of a pump to limit inrush current and water hammer throughout a system.',
  },
  {
    equipmentType: 'directOnlineStarter',
    label: 'Direct On-line Starter',
    description:
      'A direct on line starter is a power shut off switch upstream of an AC motor that prevents overloading and short circuits.',
  },
  {
    equipmentType: 'starDeltaStarter',
    label: 'Star Delta Starter',
    description:
      'A star delta starter raises AC voltage in fixed increments when starting a motor to reduce starting torque and provide inrush current relief. An example may be a star delta starter upstream of a motor powered mill to reduce inrush current.  Star delta starters need to be assembled from multiple contactors, thermal overload relay, timer, and connection set.',
  },
  {
    equipmentType: 'capacitorBank',
    label: 'Capacitor Bank',
    description:
      "A capacitor bank stores energy to support a motor's 'parasitic' power consumption, or reactive power. By reducing the amount of reactive power required from the grid, power factor approaches 1 and fees from a utility can be avoided. An example is a welder with a power factor of 0.6 can be equipped with a capacitor bank to boost power factor to 0.95.",
  },
  {
    equipmentType: 'threeFourPointDcMotorStarter',
    label: 'Three/Four Point DC Motor Starter',
    description:
      "A three or four point DC motor starter reduces starting current and stabilizes starting motor voltage. An example is a 48V DC shunt motor driven lathe in which a motor starter brings down inrush current and stabilizes voltage to extend the motor's useful life.",
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
