import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Header, Table, Grid } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'
import { formatDateForTable } from '../../../utils/helpers'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
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

    // Calculate domain and heights of charts so that they have the same scale relative to each other
    const becMax = _.maxBy(hybridColumns, 'batteryEnergyContent')['batteryEnergyContent']
    const becDomainMax = _.ceil(becMax + becMax * 0.1)
    const becHeight = 400
    const heightDomainRatio = becHeight / becDomainMax

    const excessMax = _.maxBy(hybridColumns, 'totalExcessProduction')['totalExcessProduction']
    const excessDomainMax = _.ceil(excessMax + excessMax * 0.1)
    const excessHeight = heightDomainRatio * excessDomainMax

    const unmetMax = _.maxBy(hybridColumns, 'totalUnmetLoad')['totalUnmetLoad']
    const unmetDomainMax = _.ceil(unmetMax + unmetMax * 0.1)
    const unmetHeight = heightDomainRatio * unmetDomainMax

    return (
      <div style={{ paddingTop: '16px' }}>
        <ChartHeader title="Excess Production" />
        <ResponsiveContainer minWidth={1000} minHeight={60}>
          <AreaChart
            height={excessHeight}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
            <Tooltip content={<CustomToolTip field="totalExcessProduction" />} />
            <Area
              type="monotone"
              dataKey="totalExcessProduction"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill={chartColorsByKey['totalExcessProduction']}
              fillOpacity="1"
            />
            <Brush startIndex={brushStartDomain[0]} endIndex={brushStartDomain[1]} height={0} />
          </AreaChart>
        </ResponsiveContainer>

        <ChartHeader title="Battery Energy Content" />
        <ResponsiveContainer minWidth={1000} minHeight={400}>
          <AreaChart
            height={becHeight}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 0, right: 30, left: 0, bottom: -20 }}>
            <XAxis dataKey="hour" />
            <YAxis
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
              domain={[0, becDomainMax]}
              allowDataOverflow={true}
            />
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
              stroke={chartColorsByKey['totalExcessProduction']}
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={batteryMinEnergyContent}
              stroke={chartColorsByKey['totalUnmetLoad']}
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
        <ResponsiveContainer minWidth={1000} minHeight={60}>
          <AreaChart
            height={unmetHeight}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
            <Tooltip content={<CustomToolTip field="totalUnmetLoad" />} />
            <Area
              type="monotone"
              dataKey="totalUnmetLoad"
              stroke={'rgb(102, 102, 102)'}
              strokeWidth={0.5}
              fill={chartColorsByKey['totalUnmetLoad']}
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
  marginTop: '10px',
  marginBottom: '10px',
  marginLeft: '60px',
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
      {field === 'totalExcessProduction' && (
        <Grid>
          <Grid.Column width={8}>Hour of Year: {label}</Grid.Column>
          <Grid.Column width={8} textAlign="right">
            {formatDateForTable(datetime)}
          </Grid.Column>
        </Grid>
      )}
      <Table basic="very" compact>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell>{fieldDefinitions[field].title}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              {_.round(val, 2)} {fieldDefinitions[field].units}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}
