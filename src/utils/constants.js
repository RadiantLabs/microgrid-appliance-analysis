import _ from 'lodash'

export const PI = 3.14
export const HOURS_PER_YEAR = 8760

// Luxon Tokens: https://moment.github.io/luxon/docs/manual/formatting.html#toformat
// HOMER's date format looks like '1/12/07 9:00'
export const homerParseFormat = 'L/d/yy H:mm'

// Appliance date format: "2018-01-01 01:00:00"
export const applianceParseFormat = 'yyyy-LL-dd HH:mm:ss'

// export const tableDateFormat = 'yyyy-MM-dd HH:mm'
export const tableDateFormat = 'MMM dd H:mm'

// Color palettes:
// https://semantic-ui.com/usage/theming.html
// https://blog.graphiq.com/finding-the-right-color-palettes-for-data-visualizations-fcd4e707a283
// https://refactoringui.com/previews/building-your-color-palette/
// https://learnui.design/tools/data-color-picker.html

export const greyColors = [
  '#212934',
  '#5F6B7A',
  '#8795A7',
  '#B8C4CE',
  '#CFD6DE',
  '#E1E7EC',
  '#F8F9FA',
]

export const chartColorsByIndex = ['#003f5c', '#444e86', '#955196', '#DD5182', '#FF6E54', '#FFA601']

export const tableColorsByKey = {
  appliance: '#DD5182',
  homer: '#FFA601',
  hybridColumns: '#444e86',
  excluded: greyColors[5],
  default: '#f9fafb',
}

export const chartColorsByKey = {
  // Loads
  newAppliancesLoad: '#003f5c',
  availableCapacity: '#DD5182',
  availableCapacityAfterNewLoad: '#955196',
  newApplianceBatteryConsumption: '#FFA601',

  // Unmet Loads
  originalUnmetLoad: '#FFA601',
  newTotalUnmetLoad: '#444e86',
  additionalUnmetLoad: '#FF6E54',

  // Battery Energy Content
  energyContentAboveMin: '#003f5c',
  newApplianceBatteryEnergyContent: '#DD5182',
  originalBatteryEnergyContentDelta: '#FFA601',
}

export const getChartColors = key => _.get(chartColorsByKey, key, greyColors[2])
