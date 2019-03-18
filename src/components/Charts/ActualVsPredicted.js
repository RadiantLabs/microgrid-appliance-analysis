import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Loader } from 'semantic-ui-react'
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

const ActualVsPredicted = ({ store }) => {
  const { viewedGrid } = store
  const {
    batteryIsTraining,
    batteryPlottablePredictionVsActualData,
    referenceLineData,
    xAccessor = 'actual',
    yAccessor = 'predicted',
  } = viewedGrid
  return (
    <div>
      <Loader
        active={batteryIsTraining}
        inline="centered"
        style={{ position: 'absolute', top: '40%', left: '50%' }}
      />
      <ResponsiveContainer height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number"
            dataKey={xAccessor}
            domain={['dataMin', 'dataMax']}
            label={{
              value: xAccessor,
              offset: -10,
              position: 'insideBottom',
            }}
          />
          <YAxis
            type="number"
            dataKey={yAccessor}
            domain={['dataMin', 'dataMax']}
            label={{ value: yAccessor, angle: -90 }}
          />
          <CartesianGrid />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend verticalAlign="top" align="right" />
          <Scatter
            name="Training data"
            data={batteryPlottablePredictionVsActualData}
            fill="#83A1C3"
            shape={<Dot r={1} />}
          />
          <Scatter
            name="Reference Line"
            data={referenceLineData}
            fill="#E20000"
            line={{ strokeDasharray: '5 5' }}
            legendType="line"
            shape={<Dot r={0} />}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default inject('store')(observer(ActualVsPredicted))
