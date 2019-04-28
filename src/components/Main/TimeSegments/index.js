import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Form, Checkbox, Grid, Label, Icon } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import {
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  // AreaChart,
  // Area,
  // ReferenceLine,
} from 'recharts'
import { formatDateForTable } from '../../../utils/helpers'
import { getChartColors } from '../../../utils/constants'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
import TimeSegmentControls from './TimeSegmentControls'

class TimeSegments extends React.Component {
  render() {
    const { summaryStats, timeSegments, timeSegmentGroups } = this.props.store
    if (_.isEmpty(timeSegments)) {
      return <LoaderSpinner />
    }
    const { allUnmetLoadHist } = summaryStats
    return (
      <div>
        <TimeSegmentControls />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <BarChart data={allUnmetLoadHist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="hourOfDay" />
            <YAxis />
            <Tooltip content={<CustomToolTip />} />
            {/* <Legend /> */}
            <Bar dataKey="originalUnmetLoad" fill={getChartColors('originalUnmetLoad')} />
            <Bar dataKey="totalUnmetLoad" fill={getChartColors('totalUnmetLoad')} />
          </BarChart>
        </ResponsiveContainer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16} textAlign="center">
              <Label basic style={{ borderBottom: '4px solid rgb(68, 78, 134)' }}>
                <Icon name="check square outline" />
                Original Unmet Loads
              </Label>
              <Label basic style={{ borderBottom: '4px solid rgb(221, 81, 130)' }}>
                <Icon name="square outline" />
                New Appliance Unmet Loads
              </Label>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <br />
        <br />
        <code>{_.truncate(JSON.stringify(timeSegmentGroups, null, 2))}</code>
        <code>{_.truncate(JSON.stringify(timeSegments, null, 2))}</code>
      </div>
    )
  }
}

export default inject('store')(observer(TimeSegments))

// Tooltip
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
                <Table.Cell>{fieldDefinitions[element.dataKey].title}</Table.Cell>
                <Table.Cell textAlign="right">
                  {_.round(element.value, 2)} {fieldDefinitions[element.dataKey].units}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>Combined Load</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              {_.round(totalElectricalLoadServed, 2)}{' '}
              {fieldDefinitions['totalElectricalLoadServed'].units}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  )
}
