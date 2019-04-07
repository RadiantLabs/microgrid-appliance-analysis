import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Table, Button } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import {
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts'
import { formatDateForTable } from '../../../utils/helpers'
import { chartColorsByKey } from '../../../utils/constants'

class LoadsByHour extends React.Component {
  state = { stackOffset: 'none' }

  handleStackClick = (value, e) => {
    e.preventDefault()
    this.setState({ stackOffset: value })
  }

  render() {
    const { combinedTable } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { stackOffset } = this.state
    const { maxLoadValue, maxLoadFirstHour } = this.props.store.maxApplianceLoad
    const yAxisDomainMax = _.ceil(maxLoadValue + maxLoadValue * 0.05, 2)
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <h3>
                Loads by hour of year <br />
                <small style={{ fontWeight: '300' }}>
                  Each data point unit is average kW for 1 hour (kW*h)
                </small>
              </h3>
            </Grid.Column>
            <Grid.Column width={8}>
              <Button.Group basic compact style={{ float: 'right', marginTop: '8px' }}>
                <Button
                  onClick={this.handleStackClick.bind(null, 'none')}
                  active={stackOffset === 'none'}>
                  Normal Stacked
                </Button>
                <Button
                  onClick={this.handleStackClick.bind(null, 'expand')}
                  active={stackOffset === 'expand'}>
                  100% Stacked
                </Button>
              </Button.Group>
              <Table basic="very" compact collapsing style={{ marginTop: 0 }}>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Max Appliance Load</Table.Cell>
                    <Table.Cell>{maxLoadValue} kW*h</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>First hour of max load</Table.Cell>
                    <Table.Cell>{maxLoadFirstHour}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <AreaChart
            data={combinedTable}
            stackOffset={stackOffset}
            margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="hour" />
            <YAxis domain={stackOffset === 'none' ? [0, yAxisDomainMax] : null} />
            <Tooltip content={<CustomToolTip />} />
            <Area
              type="monotone"
              dataKey="Original Electrical Load Served"
              stackId="1"
              stroke={chartColorsByKey['Original Electrical Load Served']}
              fill={chartColorsByKey['Original Electrical Load Served']}
              fillOpacity="1"
            />
            <Area
              type="monotone"
              dataKey="newAppliancesLoad"
              stackId="1"
              stroke={chartColorsByKey['newAppliancesLoad']}
              fill={chartColorsByKey['newAppliancesLoad']}
              fillOpacity="1"
            />
            <Area
              type="monotone"
              dataKey="newAppliancesAncillaryLoad"
              stackId="1"
              stroke={chartColorsByKey['newAppliancesAncillaryLoad']}
              fill={chartColorsByKey['newAppliancesAncillaryLoad']}
              fillOpacity="1"
            />
            <ReferenceLine
              x={maxLoadFirstHour}
              stroke={chartColorsByKey['newAppliancesAncillaryLoad']}
              label="First Hour Max Load"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={maxLoadValue}
              label={`Max Appliance Load: ${_.round(maxLoadValue, 2)}`}
              stroke={chartColorsByKey['newAppliancesAncillaryLoad']}
              strokeDasharray="3 3"
            />
            <Legend />
            <Brush startIndex={0} endIndex={200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(LoadsByHour))

const CustomToolTip = ({ active, payload, label }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  const { datetime, totalElectricalLoadServed } = payload[0]['payload']
  return (
    <div className="custom-tooltip">
      <p className="label">Hour of Year: {label}</p>
      <p className="label">Date: {formatDateForTable(datetime)}</p>
      <Table basic="very" compact>
        <Table.Body>
          {_.map(payload, element => {
            return (
              <Table.Row style={{ color: element.color }} key={element.dataKey}>
                <Table.Cell>{element.dataKey}</Table.Cell>
                <Table.Cell textAlign="right">{element.value} kW*h</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>Combined Load</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">{totalElectricalLoadServed} kW*h</Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  )
}
