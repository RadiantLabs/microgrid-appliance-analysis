import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { TinyBarChart } from '../Charts/TinyBar'

const GridOperatorSummary = ({ store }) => {
  const { summaryStats } = store
  const newUnmetLoadCount = _.get(summaryStats, 'newUnmetLoadCount', '-')
  const newUnmetLoadCountPercent = _.get(summaryStats, 'newUnmetLoadCountPercent', '-')
  const newUnmetLoadSum = _.get(summaryStats, 'newUnmetLoadSum', '-')
  const newUnmetLoadHist = _.get(summaryStats, 'newUnmetLoadHist', [])

  const totalUnmetLoadCount = _.get(summaryStats, 'totalUnmetLoadCount', '-')
  const totalUnmetLoadCountPercent = _.get(summaryStats, 'totalUnmetLoadCountPercent', '-')
  const totalUnmetLoadSum = _.get(summaryStats, 'totalUnmetLoadSum', '-')
  const totalUnmetLoadHist = _.get(summaryStats, 'totalUnmetLoadHist', [])

  return (
    <Table basic="very" celled collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell>New Unmet Load Count</Table.Cell>
          <Table.Cell>
            {newUnmetLoadCount} hr/year <em> ({newUnmetLoadCountPercent} %)</em>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>New Unmet Load Sum</Table.Cell>
          <Table.Cell>{newUnmetLoadSum} kWh</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>New Unmet Load By Hour</Table.Cell>
          <Table.Cell>
            <TinyBarChart data={newUnmetLoadHist} x="hour_of_day" y="counts" domain={[0, 23]} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Total Unmet Load Count</Table.Cell>
          <Table.Cell>
            {totalUnmetLoadCount} hr/year <em> ({totalUnmetLoadCountPercent} %)</em>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Total Unmet Load Sum</Table.Cell>
          <Table.Cell>{totalUnmetLoadSum} kWh</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Total Unmet Load Sum</Table.Cell>
          <Table.Cell>
            <TinyBarChart data={totalUnmetLoadHist} x="hour_of_day" y="counts" domain={[0, 23]} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(GridOperatorSummary))
