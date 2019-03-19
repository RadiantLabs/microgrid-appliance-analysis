import * as React from 'react'
import { observer, inject } from 'mobx-react'
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

class BatteryCharge extends React.Component {
  render() {
    const { activeGrid, hybridColumns } = this.props.store
    if (_.isEmpty(hybridColumns)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h3>
          Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
        </h3>
        <BatteryChargeTable grid={activeGrid} />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <LineChart
            width={1400}
            height={400}
            data={hybridColumns}
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
