export const homerFiles = [
  {
    type: 'homer',
    label: '12-50 Baseline',
    path: './data/homer/12-50 Baseline.csv',
    description: 'Baseline: Fill in description about 12, 50, etc',
    // columns: {
    //   batteryEnergyContent: 'Generic 1kWh Lead Acid [ASM] Energy Content',
    //   batteryStateOfCharge: 'Generic 1kWh Lead Acid [ASM] State of Charge',
    // },
  },
  {
    type: 'homer',
    label: '12-50 Oversize 20',
    path: './data/homer/12-50 Oversize 20.csv',
    description: 'Oversized: Fill in description about 12, 50, etc',
  },
  {
    type: 'homer',
    label: '12-50 Undersize 20',
    path: './data/homer/12-50 Undersize 20.csv',
    description: 'Undersized: Fill in description about 12, 50, etc',
  },
  // {
  //   type: 'homer',
  //   label: 'homer_12_50_oversize_20_AS',
  //   path: './data/homer/homer_12_50_oversize_20_AS.csv',
  //   description: 'Fill in description about 12, 50, etc',
  // },
]

export const applianceFiles = [
  {
    type: 'appliance',
    applianceType: 'rice_mill',
    label: 'Rice Mill (Tanzania)',
    path: './data/appliances/rice_mill_usage_profile.csv',
    description:
      'Rice mill usage profile from downloaded UTC file usage (Tanzania)',
  },
  {
    type: 'appliance',
    applianceType: 'maize_mill',
    label: 'Maize Mill (Tanzania)',
    path: './data/appliances/maize_mill_usage_profile_1.csv',
    description:
      'Maize mill usage profile (1) from downloaded UTC file (Tanzania)',
  },
  {
    type: 'appliance',
    applianceType: 'maize_mill',
    label: 'Maize Mill (Tanzania)',
    path: './data/appliances/maize_mill_usage_profile_2.csv',
    description:
      'Maize mill usage profile (2) from downloaded UTC sensor file (Tanzania)',
  },
  {
    type: 'appliance',
    applianceType: 'welder',
    label: 'Welder (Tanzania)',
    path: './data/appliances/welder_usage_profile.csv',
    description:
      'Welder usage profile from downloaded UTC sensor file (Tanzania)',
  },
]
