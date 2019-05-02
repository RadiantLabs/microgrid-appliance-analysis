import * as React from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { timeSegmentColors, timeSegmentLabels } from '../../../utils/constants'
import { xAxisFormatter } from './xAxisFormatter'
import { CustomToolTip } from './ToolTip'

export const StackedArea = ({
  hist,
  stackOffset,
  timeSegmentsBy,
  timeSegmentsAggregation,
  isStacked,
  columns,
  totalsColumnName,
  show,
}) => {
  return (
    <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
      <AreaChart
        data={hist}
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
        {show.has(columns[0]) && (
          <Area
            type="monotone"
            dataKey={columns[0]}
            stackId="1"
            stroke={timeSegmentColors[0]}
            fill={timeSegmentColors[0]}
            fillOpacity="1"
          />
        )}
        {show.has(columns[1]) && (
          <Area
            type="monotone"
            dataKey={columns[1]}
            stackId={isStacked ? '1' : '2'}
            stroke={timeSegmentColors[1]}
            fill={timeSegmentColors[1]}
            fillOpacity="1"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
