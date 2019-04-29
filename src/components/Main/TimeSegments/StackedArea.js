import * as React from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { timeSegmentColors } from '../../../utils/constants'
import { timeSegmentLabels } from '../../../utils/calcTimeSegments'
import { CustomToolTip } from './ToolTip'

export const StackedArea = ({
  hist,
  stackOffset,
  timeSegmentsBy,
  timeSegmentsMetric,
  columns,
  show,
}) => {
  const isStacked = timeSegmentsMetric !== 'excessProduction'
  return (
    <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
      <AreaChart
        data={hist}
        stackOffset={stackOffset}
        margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
        <XAxis
          dataKey={timeSegmentsBy}
          label={{ value: timeSegmentLabels[timeSegmentsBy], position: 'bottom', offset: 0 }}
        />
        <YAxis />
        <Tooltip content={<CustomToolTip />} columns={columns} timeSegmentsBy={timeSegmentsBy} />
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
