import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { greyColors } from '../../../utils/constants'

function gradientOffset(min, max) {
  if (max <= 0) {
    return 0
  } else if (min >= 0) {
    return 1
  }
  return max / (max - min)
}

class BatteryEnergyContent extends React.Component {
  render() {
    const { hybridColumns, activeGrid } = this.props.store
    if (_.isEmpty(hybridColumns)) {
      return <LoaderSpinner />
    }
    const { batteryMinEnergyContent, batteryMaxEnergyContent } = activeGrid
    const off = gradientOffset(batteryMinEnergyContent, batteryMaxEnergyContent)
    console.log('off: ', off)
    return (
      <div>
        <h3>
          Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
        </h3>
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <AreaChart
            width={600}
            height={400}
            data={hybridColumns}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor="rgb(33, 186, 69, 0.8)" stopOpacity={1} />
                <stop offset={off} stopColor="red" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="batteryEnergyContent"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill="url(#splitColor)"
            />
            <Legend />
            <Brush startIndex={0} endIndex={200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryEnergyContent))
