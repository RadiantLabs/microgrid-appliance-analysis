import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../Loader'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from 'recharts'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines

class LoadCurves extends React.Component {
  render() {
    const { combinedTable, homerStats } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { tableData } = combinedTable
    return (
      <div>
        <h4>Loads by hour of year</h4>
        <LineChart
          width={1000}
          height={400}
          data={tableData}
          syncId="anyId"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="appliance_load" dot={false} stroke="#82ca9d" />
          <Brush startIndex={1000} endIndex={1200} />
        </LineChart>
      </div>
    )
  }
}

export default inject('store')(observer(LoadCurves))
