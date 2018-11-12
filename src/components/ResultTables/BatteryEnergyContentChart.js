import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../Loader'
import { LineChart, Line, XAxis, YAxis, Tooltip, Brush, Legend } from 'recharts'
import { getChartColors, greyColors } from '../../utils/constants'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines

class BatteryEnergyContentChart extends React.Component {
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
          Battery Energy Content by hour of year{' '}
          <small style={{ color: greyColors[1] }}>kWh</small>
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
            dataKey="energyContentAboveMin"
            dot={false}
            stroke={getChartColors('energyContentAboveMin')}
          />
          <Line
            type="monotone"
            dataKey="newApplianceBatteryEnergyContent"
            dot={false}
            stroke={getChartColors('newApplianceBatteryEnergyContent')}
          />
          <Legend />
          <Brush startIndex={0} endIndex={200} />
        </LineChart>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryEnergyContentChart))
