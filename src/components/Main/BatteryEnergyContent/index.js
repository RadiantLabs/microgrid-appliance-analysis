import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Header, Table } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'
import { formatDateForTable } from '../../../utils/helpers'
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
import { chartColorsByKey } from '../../../utils/constants'

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
        <ChartHeader title="Excess Production" />
        <ResponsiveContainer minWidth={1000} minHeight={100} height="90%">
          <AreaChart
            width={600}
            height={100}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomToolTip field="newExcessProduction" />} />
            <Area
              type="monotone"
              dataKey="newExcessProduction"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill={chartColorsByKey['newExcessProduction']}
              fillOpacity="1"
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
            <Tooltip content={<CustomToolTip field="batteryEnergyContent" />} />
            <Area
              type="monotone"
              dataKey="batteryEnergyContent"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill={chartColorsByKey['batteryEnergyContent']}
              fillOpacity="1"
            />
            <ReferenceLine
              y={batteryMaxEnergyContent}
              label={{
                position: 'top',
                value: `Max Battery Energy Content: ${_.round(batteryMaxEnergyContent, 2)}`,
                fontWeight: 500,
                textStroke: '2px white',
              }}
              stroke={chartColorsByKey['newExcessProduction']}
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={batteryMinEnergyContent}
              stroke={chartColorsByKey['newUnmetLoad']}
              label={{
                position: 'top',
                value: `Min Battery Energy Content: ${_.round(batteryMinEnergyContent, 2)}`,
                fontWeight: 500,
                textStroke: '2px white',
              }}
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
            <Tooltip content={<CustomToolTip field="newUnmetLoad" />} />
            <Area
              type="monotone"
              dataKey="newUnmetLoad"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill={chartColorsByKey['newUnmetLoad']}
              fillOpacity="1"
            />
            <Brush startIndex={brushStartDomain[0]} endIndex={brushStartDomain[1]} gap={5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryEnergyContent))

//
// -----------------------------------------------------------------------------
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

const CustomToolTip = ({ active, payload, label, field }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }

  const { datetime } = payload[0]['payload']
  const val = payload[0]['payload'][field]
  return (
    <div className="custom-tooltip">
      {field === 'newExcessProduction' && <p className="label">Hour of Year: {label}</p>}
      {field === 'newExcessProduction' && (
        <p className="label">Date: {formatDateForTable(datetime)}</p>
      )}
      <Table basic="very" compact>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell>{field}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">{val} kWh</Table.HeaderCell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}
