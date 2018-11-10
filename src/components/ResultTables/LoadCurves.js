import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../Loader'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from 'recharts'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines

const data = [
  { name: 'Page A', uv: 4000, pv: 9000 },
  { name: 'Page B', uv: 3000, pv: 7222 },
  { name: 'Page C', uv: 2000, pv: 6222 },
  { name: 'Page D', uv: 1223, pv: 5400 },
  { name: 'Page E', uv: 1890, pv: 3200 },
  { name: 'Page F', uv: 2390, pv: 2500 },
  { name: 'Page G', uv: 3490, pv: 1209 },
]

class LoadCurves extends React.Component {
  render() {
    const { combinedTable, homerStats } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { dataTable } = combinedTable
    return (
      <div>
        <h4>A demo of synchronized AreaCharts</h4>
        <LineChart
          width={1000}
          height={400}
          data={data}
          syncId="anyId"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pv" stroke="#82ca9d" fill="#82ca9d" />
          <Brush />
        </LineChart>
      </div>
    )
  }
}

export default inject('store')(observer(LoadCurves))
