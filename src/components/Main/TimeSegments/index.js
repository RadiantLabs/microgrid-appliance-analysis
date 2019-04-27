import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'
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
    const { summaryStats, timeSegments } = this.props.store
    if (_.isEmpty(timeSegments)) {
      return <LoaderSpinner />
    }
    const { allUnmetLoadHist } = summaryStats
    return (
      <div>
        <TimeSegmentControls />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <BarChart data={allUnmetLoadHist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="hour_of_day" />
            <YAxis />
            <Tooltip content={<CustomToolTip />} />
            <Legend />
            <Bar dataKey="originalUnmetLoad" fill={getChartColors('originalUnmetLoad')} />
            <Bar dataKey="totalUnmetLoad" fill={getChartColors('totalUnmetLoad')} />
          </BarChart>
        </ResponsiveContainer>
        <code>{_.truncate(JSON.stringify(timeSegments, null, 2))}</code>
      </div>
    )
  }
}

export default inject('store')(observer(TimeSegments))

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
