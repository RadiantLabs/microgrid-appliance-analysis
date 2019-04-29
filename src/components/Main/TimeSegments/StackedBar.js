import * as React from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { timeSegmentColors } from '../../../utils/constants'
import { CustomToolTip } from './ToolTip'

export const StackedBar = ({ hist, stackOffset, timeSegmentsBy, columns, show }) => {
  return (
    <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
      <BarChart
        data={hist}
        stackOffset={stackOffset}
        margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey={timeSegmentsBy} />
        <YAxis />
        <Tooltip content={<CustomToolTip />} columns={columns} timeSegmentsBy={timeSegmentsBy} />
        {show.has(columns[0]) && (
          <Bar
            type="monotone"
            dataKey={columns[0]}
            stackId="1"
            stroke={timeSegmentColors[0]}
            fill={timeSegmentColors[0]}
            fillOpacity="1"
          />
        )}
        {show.has(columns[1]) && (
          <Bar
            type="monotone"
            dataKey={columns[1]}
            stackId="1"
            stroke={timeSegmentColors[1]}
            fill={timeSegmentColors[1]}
            fillOpacity="1"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
