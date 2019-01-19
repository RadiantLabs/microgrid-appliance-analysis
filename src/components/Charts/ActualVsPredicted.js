import * as React from 'react'
import { Loader } from 'semantic-ui-react'
import _ from 'lodash'
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

const ActualVsPredicted = ({
  data,
  xAccessor = 'actual',
  yAccessor = 'predicted',
  isTraining,
  predictionLegend,
}) => {
  const actualRange = _.range(_.minBy(data, 'actual'), _.maxBy(data, 'actual'))
  const referenceLineData = _.map(actualRange, val => {
    return { x: val, y: val }
  })
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
          <Scatter name="Training data" data={data} fill="#83A1C3" shape={<Dot r={1} />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ActualVsPredicted

// <Scatter name="Reference Line" data={referenceLineData} fill="#8884d8" fill="#000" />
// <ReferenceLine x={1} label="Max" stroke="red" strokeDasharray="3 3" />
// {data && (
//   <Scatter
//     name={predictionLegend}
//     data={data}
//     fill="#FF6346"
//     line
//     shape={<Dot r={0} />}
//   />
// )}
