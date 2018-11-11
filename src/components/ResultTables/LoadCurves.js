import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../Loader'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Brush, Legend } from 'recharts'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines

class LoadCurves extends React.Component {
  render() {
    const { combinedTable, summaryStats, homerStats } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { tableData } = combinedTable
    console.log('summaryStats: ', summaryStats)
    console.log('available keys: ', _.first(tableData))
    // debugger
    return (
      <div>
        <h4>Loads by hour of year</h4>
        <LineChart
          width={1400}
          height={400}
          data={tableData}
          syncId="anyId"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="newApplianceBatteryEnergyContent"
            dot={false}
            stroke="#82ca9d"
          />
          <Line type="monotone" dataKey="appliance_load" dot={false} stroke="#red" />
          <Line type="monotone" dataKey="appliance_load" dot={false} stroke="#82ca9d" />
          <Line type="monotone" dataKey="availableCapacityAfterNewLoad" dot={false} stroke="red" />
          <Legend />
          <Brush startIndex={0} endIndex={200} />
        </LineChart>
      </div>
    )
  }
}

export default inject('store')(observer(LoadCurves))
