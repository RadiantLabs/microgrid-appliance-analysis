import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Header } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'
import {
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts'

class BatteryEnergyContent extends React.Component {
  render() {
    const { hybridColumns, activeGrid } = this.props.store
    if (_.isEmpty(hybridColumns)) {
      return <LoaderSpinner />
    }
    const { batteryMinEnergyContent, batteryMaxEnergyContent } = activeGrid
    const brushStartDomain = [0, 200]
    return (
      <div>
        {/*<h3>
          Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
        </h3>*/}

        <ChartHeader title="Excess Production" />
        <ResponsiveContainer minWidth={1000} minHeight={100} height="90%">
          <AreaChart
            width={600}
            height={100}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="newExcessProduction"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill="#82ca9d"
            />
            <Brush startIndex={brushStartDomain[0]} endIndex={brushStartDomain[1]} height={0} />
          </AreaChart>
        </ResponsiveContainer>

        <ChartHeader title="Battery Energy Content" />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <AreaChart
            width={600}
            height={400}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="hour" />
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="batteryEnergyContent"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill="#8884d8"
            />
            <ReferenceLine
              y={batteryMinEnergyContent}
              stroke="red"
              label={`Min Battery Energy Content: ${_.round(batteryMinEnergyContent, 2)}`}
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={batteryMaxEnergyContent}
              label={`Max Battery Energy Content: ${_.round(batteryMaxEnergyContent, 2)}`}
              stroke="red"
              strokeDasharray="3 3"
            />
            <Brush
              startIndex={brushStartDomain[0]}
              endIndex={brushStartDomain[1]}
              height={0}
              gap={5}
            />
          </AreaChart>
        </ResponsiveContainer>

        <ChartHeader title="Unmet Load" />
        <ResponsiveContainer minWidth={1000} minHeight={100} height="90%">
          <AreaChart
            width={600}
            height={100}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="newUnmetLoad"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill="#ffc658"
            />
            <Brush startIndex={brushStartDomain[0]} endIndex={brushStartDomain[1]} gap={5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryEnergyContent))

const chartLabelStyle = {
  marginLeft: '60px',
  marginTop: '10px',
  marginBottom: 0,
}

const ChartHeader = ({ title }) => {
  return (
    <Header as="h3" style={chartLabelStyle}>
      {title}
    </Header>
  )
}
