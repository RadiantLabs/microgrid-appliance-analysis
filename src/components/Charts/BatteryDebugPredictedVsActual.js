import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Loader } from 'semantic-ui-react'
import { calcReferenceLineFlexible } from '../../utils/calcReferenceLineFlexible'
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

const BatteryDebugPredictedVsActual = ({ store, actual = 'homerOriginal', predicted }) => {
  const { batteryDebugData } = store
  if (_.isEmpty(batteryDebugData)) {
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
  const dataMin = _.minBy(batteryDebugData, predicted)[predicted]
  const dataMax = _.maxBy(batteryDebugData, predicted)[predicted]
  const data = _.sampleSize(batteryDebugData, 2000)
  const refLineData = calcReferenceLineFlexible(batteryDebugData, actual, predicted)
  return (
    <ResponsiveContainer height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
        <XAxis
          type="number"
          dataKey={actual}
          domain={[dataMin, dataMax]}
          label={{
            value: actual,
            offset: -10,
            position: 'insideBottom',
          }}
        />
        <YAxis
          type="number"
          dataKey={predicted}
          domain={[dataMin, dataMax]}
          label={{ value: predicted, angle: -90 }}
        />
        <CartesianGrid />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" align="right" />
        <Scatter name="Training data" data={data} fill="#83A1C3" shape={<Dot r={1} />} />
        <Scatter
          name="Reference Line"
          data={refLineData}
          fill="#E20000"
          line={{ strokeDasharray: '5 5' }}
          legendType="line"
          shape={<Dot r={0} />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default inject('store')(observer(BatteryDebugPredictedVsActual))
