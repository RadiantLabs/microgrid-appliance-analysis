import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const ApplianceOperatorSummary = ({ store }) => {
  const { summaryStats } = store

  const yearlyKwh = _.get(summaryStats, 'yearlyKwh', '-')

  return (
    <Table basic="very" celled collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Yearly kWh from new appliance</Table.Cell>
          <Table.Cell>{yearlyKwh} kWh</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ApplianceOperatorSummary))
