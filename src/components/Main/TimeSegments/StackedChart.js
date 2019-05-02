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

export const StackedChart = ({
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
  return (
    <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
      <ChartWrapper
        data={hist}
        barGap={barGap}
        stackOffset={stackOffset}
        margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
        <XAxis
          dataKey={timeSegmentsBy}
          label={{ value: timeSegmentLabels[timeSegmentsBy], position: 'bottom', offset: 0 }}
          tickFormatter={xAxisFormatter.bind(null, timeSegmentsBy)}
        />
        <YAxis />
        <Tooltip
          content={<CustomToolTip />}
          totalsColumnName={totalsColumnName}
          timeSegmentsBy={timeSegmentsBy}
          timeSegmentsAggregation={timeSegmentsAggregation}
        />
        {_.map(columns, (column, columnIndex) => {
          return (
            <Chart
              key={column}
              type="monotone"
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
}
