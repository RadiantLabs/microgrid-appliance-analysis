import * as React from 'react'
import _ from 'lodash'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import { timeSegmentColors, timeSegmentLabels } from '../../../utils/constants'
import { xAxisFormatter } from './xAxisFormatter'
import { CustomToolTip } from './ToolTip'

export const HourOfWeekChart = ({
  hist,
  chartType,
  stackOffset,
  timeSegmentsBy,
  timeSegmentsAggregation,
  isStacked,
  columns,
  totalsColumnName,
}) => {
  const ChartWrapper = chartType === 'area' ? AreaChart : BarChart
  const Chart = chartType === 'area' ? Area : Bar
  const barGap = chartType === 'area' ? null : 0

  console.log('hist: ', hist)
  // Each chart row represents a single day (Monday) that goes from 1-24
  // Create 7 arrays, 1 for each day of week
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

  const byDayOfWeek = _.map(days, day => {
    const byDay = _.filter(hist, row => {
      return _.includes(row['hourOfWeek'], day)
    })
    return _.map(byDay, row => {
      const hourOfWeekSplit = row['hourOfWeek'].split('_')
      return {
        ...row,
        day: hourOfWeekSplit[0],
        hour: parseInt(hourOfWeekSplit[1], 10),
      }
    })
  })
  console.log('byDayOfWeek: ', byDayOfWeek)

  return (
    <div style={{ height: '500px' }}>
      {_.map(byDayOfWeek, (day, dayIndex) => {
        const yValue = yAxisValues[day[0].day]
        return (
          <ResponsiveContainer minWidth={1000} height="14%" key={day[0].hourOfWeek + dayIndex + ''}>
            <AreaChart
              data={day}
              stackOffset={stackOffset}
              margin={{ top: 0, right: 30, left: 0, bottom: 4 }}>
              <YAxis
                label={{ value: yValue, position: 'insideRight' }}
                width={40}
                tick={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomToolTip />}
                totalsColumnName={totalsColumnName}
                timeSegmentsBy={timeSegmentsBy}
                timeSegmentsAggregation={timeSegmentsAggregation}
              />

              {_.map(columns, (column, columnIndex) => {
                return (
                  <Area
                    key={column}
                    type="monotone"
                    name="hourOfDay"
                    dataKey={column}
                    stackId={isStacked ? 1 : columnIndex}
                    stroke={timeSegmentColors[column]}
                    fill={timeSegmentColors[column]}
                    fillOpacity="1"
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        )
      })}
    </div>
  )
}

// barGap={barGap}
/* <XAxis dataKey="hourOfWeek" /> */

const yAxisValues = {
  '0mon': 'Mon',
  '1tue': 'Tue',
  '2wed': 'Wed',
  '3thu': 'Thu',
  '4fri': 'Fri',
  '5sat': 'Sat',
  '6sun': 'Sun',
}
