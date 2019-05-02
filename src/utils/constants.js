import _ from 'lodash'

export const PI = 3.14
export const HOURS_PER_YEAR = 8760

export const unmetLoadRoundingDecimals = 1

// Luxon Tokens: https://moment.github.io/luxon/docs/manual/formatting.html#toformat
// HOMER's date format looks like '1/12/07 9:00'
export const homerParseFormat = 'L/d/yy H:mm'

// TODO: Switch over to using moment. The parse formats are in helpers
// Appliance date format: "2018-01-01 01:00:00" for Luxon:
export const applianceParseFormat = 'yyyy-LL-dd HH:mm:ss'

// export const tableDateFormat = 'yyyy-MM-dd HH:mm'
export const tableDateFormat = 'MMM dd H:mm'

export const undeletableApplianceFileId = 'rice_mill_usage_profile_2019-02-16T20:33:55.583-07:00'

// _____________________________________________________________________________
// Color palettes:
// _____________________________________________________________________________
// https://semantic-ui.com/usage/theming.html
// https://blog.graphiq.com/finding-the-right-color-palettes-for-data-visualizations-fcd4e707a283
// https://refactoringui.com/previews/building-your-color-palette/
// https://learnui.design/tools/data-color-picker.html
export const redErrorFontColor = '#db2828'
export const orangeWarningFontColor = '#f2711c'
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
  'Original Electrical Load Served': '#444e86',
  originalElectricLoadServed: '#444e86',
  newAppliancesLoad: '#955196',
  newAppliancesAncillaryLoad: '#FF6E54',

  // Unmet Loads
  originalUnmetLoad: '#444e86',
  additionalUnmetLoad: '#FF6E54',

  // Battery Energy Content
  totalExcessProduction: '#FFA601',
  batteryEnergyContent: '#444e86',
  totalUnmetLoad: '#DD5182',
}

// export const timeSegmentColors = ['#444e86', '#955196']
export const timeSegmentColors = {
  originalElectricLoadServed: '#444e86',
  originalModeledUnmetLoad: '#444e86',
  originalModeledExcessProduction: '#444e86',

  newAppliancesLoad: '#955196',
  newAppliancesUnmetLoad: '#955196',
  newAppliancesExcessProduction: '#955196',

  newAppliancesAncillaryLoad: '#FF6E54',
}

export const getChartColors = key => _.get(chartColorsByKey, key, greyColors[2])

// _____________________________________________________________________________
// Misc:
// _____________________________________________________________________________
export const dayOfWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
export const timeSegmentLabels = {
  load: 'Load',
  unmetLoad: 'Unmet Load',
  excessProduction: 'Excess Production',
  average: 'Average',
  sum: 'Sum of',
  count: 'Count of',
  hourOfDay: 'Hour of Day',
  dayOfWeek: 'Day of Week',
  month: 'Month',
  hourOfWeek: 'Hour of Week',
}
