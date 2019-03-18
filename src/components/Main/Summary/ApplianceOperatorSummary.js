import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

export const ApplianceOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    // Note: this is a cost for the appliance operator, but revenue for grid operator
    const newApplianceElectricityCost = _.get(stats, 'newApplianceGridRevenue', '-')
    // const yearlyProductionFactor = _.get(stats, 'yearlyProductionFactor', '-')
    const yearlyProductionUnitsRevenue = _.get(stats, 'yearlyProductionUnitsRevenue', '-')
    const netApplianceOwnerRevenue = _.get(stats, 'netApplianceOwnerRevenue', '-')

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
    const { enabledAppliances, multipleAppliancesEnabled, summaryStats } = store

    // This is for all enabled appliances, which also applies if only 1 is selected
    const newApplianceYearlyKwh = _.get(summaryStats, 'newApplianceYearlyKwh', '-')

    // These values only apply to a single enabled appliance
    const { applianceSummaryStats, productionUnitType } = enabledAppliances[0]
    const yearlyProductionUnits = _.round(
      _.get(applianceSummaryStats, 'yearlyProductionUnits', '-')
    )
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
              <Table.Cell>Units of Produced</Table.Cell>
              <Table.Cell>
                {multipleAppliancesEnabled ? 'Multiple Appliance Enabled' : yearlyProductionUnits}{' '}
                {productionUnitType || '-'}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
