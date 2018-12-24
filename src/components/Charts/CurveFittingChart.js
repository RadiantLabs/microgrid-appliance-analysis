import * as React from 'react'
import { Loader } from 'semantic-ui-react'
// import _ from 'lodash'
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  ScatterChart,
  Legend,
  ResponsiveContainer,
  Dot,
} from 'recharts'

const CurveFittingChart = ({
  batteryData,
  batteryPredictionData,
  xAccessor,
  yAccessor,
  isTraining,
  predictionLegend,
}) => {
  return (
    <div>
      <Loader
        active={isTraining}
        inline="centered"
        style={{ position: 'absolute', top: '40%', left: '50%' }}
      />
      <ResponsiveContainer height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number"
            dataKey={xAccessor}
            label={{
              value: xAccessor,
              offset: -10,
              position: 'insideBottom',
            }}
          />
          <YAxis type="number" dataKey={yAccessor} label={{ value: yAccessor, angle: -90 }} />
          <CartesianGrid />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend verticalAlign="top" align="right" />
          <Scatter name="Training data" data={batteryData} fill="#83A1C3" shape={<Dot r={1} />} />
          {batteryPredictionData && (
            <Scatter
              name={predictionLegend}
              data={batteryPredictionData}
              fill="#FF6346"
              line
              shape={<Dot r={0} />}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CurveFittingChart
