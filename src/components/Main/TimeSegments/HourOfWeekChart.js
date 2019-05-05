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
import { timeSegmentColors } from '../../../utils/constants'
import { yAxisFormatter } from './axisFormatters'
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

  return (
    <div style={{ height: '460px' }}>
      {_.map(byDayOfWeek, (day, dayIndex) => {
        const dayName = yAxisFormatter(day[0].day)
        const isLastChart = dayIndex === _.size(byDayOfWeek) - 1
        return (
          <ResponsiveContainer minWidth={1000} height="14%" key={day[0].hourOfWeek + dayIndex + ''}>
            <ChartWrapper
              data={day}
              barGap={barGap}
              stackOffset={stackOffset}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <XAxis
                type="category"
                dataKey="hour"
                name="hour"
                interval={0}
                tick={isLastChart ? { fontSize: '12px' } : { fontSize: 0 }}
                tickLine={{ transform: 'translate(0, -6)' }}
              />
              <YAxis
                label={{ value: dayName, position: 'insideRight' }}
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
                wrapperStyle={{ zIndex: 100 }}
              />

              {_.map(columns, (column, columnIndex) => {
                return (
                  <Chart
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
            </ChartWrapper>
          </ResponsiveContainer>
        )
      })}
    </div>
  )
}
