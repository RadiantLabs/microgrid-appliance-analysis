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

const ActualVsPredicted = ({ store }) => {
  // TODO: Uncomment these because the actual vs precdicted calc will go on
  // the grid, not mainstore
  // const { viewedGrid } = store
  // const {
  //   batteryIsTraining,
  //   batteryPlottablePredictionVsActualData,
  //   referenceLineData,
  //   xAccessor = 'actual',
  //   yAccessor = 'predicted',
  // } = viewedGrid

  const {
    predictedVsActualBatteryValues,
    predictedVsActualReferenceLine: referenceLineData,
  } = store
  const xAccessor = 'actual'
  const yAccessor = 'predicted'

  if (_.isEmpty(predictedVsActualBatteryValues)) {
    return (
      <Loader
        // active={batteryIsTraining}
        inline="centered"
        style={{ position: 'absolute', top: '40%', left: '50%' }}
      />
    )
  }
  const dataSize = _.size(predictedVsActualBatteryValues)
  const dataMin = _.minBy(predictedVsActualBatteryValues, 'actual')['actual']
  const dataMax = _.maxBy(predictedVsActualBatteryValues, 'actual')['actual']

  const maxErrorPct = _.maxBy(predictedVsActualBatteryValues, 'error')['error'] * 100
  const avgErrorPct = (_.sumBy(predictedVsActualBatteryValues, 'error') * 100) / dataSize

  console.log('Actual vs Predicted maxErrorPct: ', maxErrorPct)
  console.log('Actual vs Predicted avgErrorPct: ', avgErrorPct)

  const data = _.sampleSize(predictedVsActualBatteryValues, 2000)
  return (
    <ResponsiveContainer height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
          data={referenceLineData}
          fill="#E20000"
          line={{ strokeDasharray: '5 5' }}
          legendType="line"
          shape={<Dot r={0} />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default inject('store')(observer(ActualVsPredicted))
