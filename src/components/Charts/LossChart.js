import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { observer, inject } from 'mobx-react'

const LossChart = ({ grid }) => {
  const { batteryTrainLogs } = grid
  return (
    <ResponsiveContainer height={400}>
      <LineChart
        key={Math.random()} // Force rerendering every time the data changes
        data={batteryTrainLogs}
        margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <XAxis
          dataKey="epoch"
          label={{
            value: 'Iteration (Epoch)',
            offset: -10,
            position: 'insideBottom',
          }}
        />
        <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        {/* iconType='line' still produced a circle on a line... I wish it didn't */}
        <Legend verticalAlign="top" align="right" iconType="line" />
        <Line
          type="monotone"
          dataKey="loss"
          dot={false}
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="val_loss"
          dot={false}
          stroke="#82ca9d"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default inject('store')(observer(LossChart))
