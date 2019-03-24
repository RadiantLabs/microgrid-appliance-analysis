import * as React from 'react'
import _ from 'lodash'
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

const PredictedVsActual = ({ store }) => {
  const { viewedGrid } = store
  const {
    predictedVsActualBatteryValues,
    predictedVsActualReferenceLine,
    xAccessor = 'actual',
    yAccessor = 'predicted',
  } = viewedGrid
  if (_.isEmpty(predictedVsActualBatteryValues)) {
    console.log('returning loader')
    return (
      <Loader
        active={true}
        inline="centered"
        style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
        }}
      />
    )
  }
  const dataMin = _.minBy(predictedVsActualBatteryValues, 'actual')['actual']
  const dataMax = _.maxBy(predictedVsActualBatteryValues, 'actual')['actual']
  const data = _.sampleSize(predictedVsActualBatteryValues, 2000)
  return (
    <ResponsiveContainer height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
        <XAxis
          type="number"
          dataKey={xAccessor}
          domain={[dataMin, dataMax]}
          label={{
            value: xAccessor,
            offset: -10,
            position: 'insideBottom',
          }}
        />
        <YAxis
          type="number"
          dataKey={yAccessor}
          domain={[dataMin, dataMax]}
          label={{ value: yAccessor, angle: -90 }}
        />
        <CartesianGrid />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" align="right" />
        <Scatter name="Training data" data={data} fill="#83A1C3" shape={<Dot r={1} />} />
        <Scatter
          name="Reference Line"
          data={predictedVsActualReferenceLine}
          fill="#E20000"
          line={{ strokeDasharray: '5 5' }}
          legendType="line"
          shape={<Dot r={0} />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default inject('store')(observer(PredictedVsActual))
