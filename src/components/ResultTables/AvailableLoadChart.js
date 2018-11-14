import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../Elements/Loader'
import { LineChart, Line, XAxis, YAxis, Tooltip, Brush, Legend } from 'recharts'
import { getChartColors, greyColors } from '../../utils/constants'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
// Plot Load curve data: New Appliance Load, availableCapacity, Additional Unmet Load
class AvailableLoadChart extends React.Component {
  render() {
    const {
      combinedTable,
      // summaryStats,
      // homerStats
    } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { tableData } = combinedTable
    return (
      <div>
        <h3>
          Loads by hour of year{' '}
          <small style={{ color: greyColors[1] }}>Average kW for 1 hour</small>
        </h3>
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
            dataKey="newApplianceLoad"
            dot={false}
            stroke={getChartColors('newApplianceLoad')}
          />
          <Line
            type="monotone"
            dataKey="availableCapacity"
            dot={false}
            stroke={getChartColors('availableCapacity')}
          />
          <Line
            type="monotone"
            dataKey="availableCapacityAfterNewLoad"
            dot={false}
            stroke={getChartColors('availableCapacityAfterNewLoad')}
          />
          <Line
            type="monotone"
            dataKey="newApplianceBatteryConsumption"
            dot={false}
            stroke={getChartColors('newApplianceBatteryConsumption')}
          />
          <Legend />
          <Brush startIndex={0} endIndex={200} />
        </LineChart>
      </div>
    )
  }
}

export default inject('store')(observer(AvailableLoadChart))
