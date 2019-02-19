import * as React from 'react'
import { get } from 'lodash'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const ApplianceOperatorSummary = ({ store }) => {
  const { summaryStats: stats } = store

  const newApplianceYearlyKwh = get(stats, 'newApplianceYearlyKwh', '-')

  // Note: this is a cost for the appliance operator, but revenue for grid operator
  const newApplianceElectricityCost = get(stats, 'newApplianceElectricityRevenue', '-')
  // const yearlyProductionFactor = get(stats, 'yearlyProductionFactor', '-')
  const yearlyProductionUnits = get(stats, 'yearlyProductionUnits', '-')
  const yearlyProductionUnitsRevenue = get(stats, 'yearlyProductionUnitsRevenue', '-')
  const netApplianceOwnerRevenue = get(stats, 'netApplianceOwnerRevenue', '-')

  return (
    <Table basic="very" celled collapsing compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Appliance Electricity Consumption</Table.Cell>
          <Table.Cell>{newApplianceYearlyKwh} kWh</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Appliance Electricity Cost</Table.Cell>
          <Table.Cell>${newApplianceElectricityCost}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Units of Productivity</Table.Cell>
          <Table.Cell>{yearlyProductionUnits} units</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Appliance-Related Revenue</Table.Cell>
          <Table.Cell>${yearlyProductionUnitsRevenue}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Net Revenue</Table.Cell>
          <Table.Cell>${netApplianceOwnerRevenue}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Appliance RIO</Table.Cell>
          <Table.Cell>TODO</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Appliance Simple Payback</Table.Cell>
          <Table.Cell>
            TODO <small>Take into account cost of appliance if owner is buying it</small>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ApplianceOperatorSummary))
