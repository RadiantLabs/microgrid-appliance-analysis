import * as React from 'react'
import { get } from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

export const ApplianceOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    // Note: this is a cost for the appliance operator, but revenue for grid operator
    const newApplianceElectricityCost = get(stats, 'newApplianceElectricityRevenue', '-')
    // const yearlyProductionFactor = get(stats, 'yearlyProductionFactor', '-')
    const yearlyProductionUnitsRevenue = get(stats, 'yearlyProductionUnitsRevenue', '-')
    const netApplianceOwnerRevenue = get(stats, 'netApplianceOwnerRevenue', '-')

    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Appliance Electricity Cost</Table.Cell>
              <Table.Cell>${newApplianceElectricityCost}</Table.Cell>
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
              <Table.Cell>Appliance ROI</Table.Cell>
              <Table.Cell />
            </Table.Row>
            <Table.Row>
              <Table.Cell>Appliance Simple Payback</Table.Cell>
              <Table.Cell />
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)

export const ApplianceOperatorTechnicalSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    const newApplianceYearlyKwh = get(stats, 'newApplianceYearlyKwh', '-')
    // Note: this is a cost for the appliance operator, but revenue for grid operator
    const yearlyProductionUnits = get(stats, 'yearlyProductionUnits', '-')
    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Appliance Electricity Consumption</Table.Cell>
              <Table.Cell>{newApplianceYearlyKwh} kWh</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Units of Productivity</Table.Cell>
              <Table.Cell>{yearlyProductionUnits} units</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
