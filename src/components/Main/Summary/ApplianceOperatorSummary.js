import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

export const ApplianceOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    // Note: this is a cost for the appliance operator, but revenue for grid operator
    const newApplianceElectricityCost = _.get(stats, 'newApplianceGridRevenue', '-')
    const yearlyProductionUnitsRevenue = _.get(stats, 'yearlyProductionUnitsRevenue', '-')
    const netApplianceOwnerRevenue = _.get(stats, 'netApplianceOwnerRevenue', '-')
    const totalCapexAssignedToAppliance = _.get(stats, 'totalCapexAssignedToAppliance', '-')
    const applianceCapexAssignedToAppliance = _.get(stats, 'applianceCapexAssignedToAppliance', '-')
    const ancillaryCapexAssignedToAppliance = _.get(stats, 'ancillaryCapexAssignedToAppliance', '-')
    const applianceOwnerRoi = _.get(stats, 'applianceOwnerRoi', '-')
    const applianceOwnerPayback = _.get(stats, 'applianceOwnerPayback', '-')
    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>CAPEX (Combined)</Table.Cell>
              <Table.Cell>$ {totalCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CAPEX (Appliance)</Table.Cell>
              <Table.Cell>$ {applianceCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CAPEX (Ancillary Equipment)</Table.Cell>
              <Table.Cell>$ {ancillaryCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>Appliance Electricity Cost</Table.Cell>
              <Table.Cell>$ {newApplianceElectricityCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Appliance-Related Revenue</Table.Cell>
              <Table.Cell>$ {yearlyProductionUnitsRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Net Revenue</Table.Cell>
              <Table.Cell>$ {netApplianceOwnerRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Appliance ROI</Table.Cell>
              <Table.Cell>
                {applianceOwnerRoi} {_.isFinite(applianceOwnerRoi) ? '%' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Appliance Payback</Table.Cell>
              <Table.Cell>{applianceOwnerPayback} yrs</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)

export const ApplianceOperatorTechnicalSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats } = store
    const { yearlyProductionUnits, productionUnitType, newApplianceYearlyKwh } = summaryStats
    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Appliance Electricity Consumption</Table.Cell>
              <Table.Cell>{newApplianceYearlyKwh || 0} kWh</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Units Produced</Table.Cell>
              <Table.Cell>
                {yearlyProductionUnits} {productionUnitType}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
