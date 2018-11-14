import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const GridOperatorSummary = ({ store }) => {
  const { summaryStats } = store

  const yearlyKwh = _.get(summaryStats, 'yearlyKwh', '-')

  // Original unmet
  const originalUnmetLoadCount = _.get(
    summaryStats,
    'originalUnmetLoadCount',
    '-'
  )
  const originalUnmetLoadCountPercent = _.get(
    summaryStats,
    'originalUnmetLoadCountPercent',
    '-'
  )
  const originalUnmetLoadSum = _.get(summaryStats, 'originalUnmetLoadSum', '-')

  // Additional unmet
  const additionalUnmetLoadCount = _.get(
    summaryStats,
    'additionalUnmetLoadCount',
    '-'
  )
  const additionalUnmetLoadCountPercent = _.get(
    summaryStats,
    'additionalUnmetLoadCountPercent',
    '-'
  )
  const additionalUnmetLoadSum = _.get(
    summaryStats,
    'additionalUnmetLoadSum',
    '-'
  )

  // Total unmet
  const newTotalUnmetLoadCount = _.get(
    summaryStats,
    'newTotalUnmetLoadCount',
    '-'
  )
  const newTotalUnmetLoadCountPercent = _.get(
    summaryStats,
    'newTotalUnmetLoadCountPercent',
    '-'
  )
  const newTotalUnmetLoadSum = _.get(summaryStats, 'newTotalUnmetLoadSum', '-')

  return (
    <div>
      <Table basic="very" celled collapsing compact>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Yearly kWh from new appliance</Table.Cell>
            <Table.Cell>{yearlyKwh} kWh</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Table definition compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>
              Count <em>hrs/year</em>
            </Table.HeaderCell>
            <Table.HeaderCell>
              Sum <em>kWh</em>
            </Table.HeaderCell>
            <Table.HeaderCell>Percent of Year</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Original unmet load</Table.Cell>
            <Table.Cell>{originalUnmetLoadCount}</Table.Cell>
            <Table.Cell>{originalUnmetLoadSum}</Table.Cell>
            <Table.Cell>{originalUnmetLoadCountPercent}%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Additional unmet load</Table.Cell>
            <Table.Cell>{additionalUnmetLoadCount}</Table.Cell>
            <Table.Cell>{additionalUnmetLoadSum}</Table.Cell>
            <Table.Cell>{additionalUnmetLoadCountPercent}%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Total unmet load</Table.Cell>
            <Table.Cell>{newTotalUnmetLoadCount}</Table.Cell>
            <Table.Cell>{newTotalUnmetLoadSum}</Table.Cell>
            <Table.Cell>{newTotalUnmetLoadCountPercent}%</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}

export default inject('store')(observer(GridOperatorSummary))
