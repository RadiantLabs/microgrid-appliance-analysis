import { dayOfWeekLabels, monthLabels } from '../../../utils/constants'

export function xAxisFormatter(by, val) {
  if (by === 'dayOfWeek') {
    return dayOfWeekLabels[val]
  }
  if (by === 'month') {
    return monthLabels[val - 1]
  }
  return val
}

export function yAxisFormatter(val) {
  return dayOfWeekLabels[val]
}
