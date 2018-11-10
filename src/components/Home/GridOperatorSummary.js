import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const GridOperatorSummary = ({ store }) => {
  const { summaryStats } = store
  const newUnmetLoadCount = _.get(summaryStats, 'newUnmetLoadCount', '-')
  const newUnmetLoadCountPercent = _.get(summaryStats, 'newUnmetLoadCountPercent', '-')
  const newUnmetLoadSum = _.get(summaryStats, 'newUnmetLoadSum', '-')

  const totalUnmetLoadCount = _.get(summaryStats, 'totalUnmetLoadCount', '-')
  const totalUnmetLoadCountPercent = _.get(summaryStats, 'totalUnmetLoadCountPercent', '-')
  const totalUnmetLoadSum = _.get(summaryStats, 'totalUnmetLoadSum', '-')

  return (
    <Table basic="very" celled collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell>New Unmet Load Count</Table.Cell>
          <Table.Cell>
            {newUnmetLoadCount} hours/year <em> ({newUnmetLoadCountPercent} %)</em>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>New Unmet Load Sum</Table.Cell>
          <Table.Cell>{newUnmetLoadSum} kWh</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Total Unmet Load Count</Table.Cell>
          <Table.Cell>
            {totalUnmetLoadCount} hours/year <em> ({totalUnmetLoadCountPercent} %)</em>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Total Unmet Load Sum</Table.Cell>
          <Table.Cell>{totalUnmetLoadSum} kWh</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(GridOperatorSummary))
