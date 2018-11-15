import * as React from 'react'
import { get } from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const ApplianceOperatorSummary = ({ store }) => {
  const { summaryStats: stats } = store

  const newApplianceYearlyKwh = get(stats, 'newApplianceYearlyKwh', '-')

  // Note: this is a cost for the appliance operator, but revenue for grid operator
  const newApplianceElectricityCost = get(stats, 'newApplianceElectricityRevenue', '-')
  const yearlyProductionFactor = get(stats, 'yearlyProductionFactor', '-')
  const yearlyThroughput = get(stats, 'yearlyThroughput', '-')
  const yearlyThroughputRevenue = get(stats, 'yearlyThroughputRevenue', '-')
  const netApplianceOwnerRevenue = get(stats, 'netApplianceOwnerRevenue', '-')

  return (
    <Table basic="very" celled collapsing compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Yearly kWh from new appliance</Table.Cell>
          <Table.Cell>{newApplianceYearlyKwh} kWh</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Yearly Appliance Electricity Cost</Table.Cell>
          <Table.Cell>${newApplianceElectricityCost}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Yearly Production Factor</Table.Cell>
          <Table.Cell>{yearlyProductionFactor}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Yearly Throughput</Table.Cell>
          <Table.Cell>{yearlyThroughput} units</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Yearly Throughput Revenue</Table.Cell>
          <Table.Cell>${yearlyThroughputRevenue}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Net Revenue</Table.Cell>
          <Table.Cell>${netApplianceOwnerRevenue}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ApplianceOperatorSummary))
