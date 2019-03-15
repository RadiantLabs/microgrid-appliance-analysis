import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Message } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import BatteryChargeTable from '../../../components/Elements/BatteryChargeTable'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getChartColors, greyColors } from '../../../utils/constants'

// TODO:
// Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
class BatteryCharge extends React.Component {
  render() {
    const { activeGrid, calculatedColumns } = this.props.store
    if (_.isEmpty(calculatedColumns)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h3>
          Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
        </h3>
        <Message warning>
          This chart isn't useful yet. I need to calculate the charge characteristics of the battery
          first.
        </Message>
        <BatteryChargeTable grid={activeGrid} />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <LineChart
            width={1400}
            height={400}
            data={calculatedColumns}
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
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryCharge))
