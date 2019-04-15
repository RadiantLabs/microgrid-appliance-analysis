import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { HelperPopup } from '../../../components/Elements/HelperPopup'

export const ApplianceOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store

    const newAppliancesApplianceOwnerOpex = _.get(stats, 'newAppliancesApplianceOwnerOpex', '-')
    const yearlyProductionUnitsRevenue = _.get(stats, 'yearlyProductionUnitsRevenue', '-')
    const applianceOperatorNewAppliancesNetIncome = _.get(
      stats,
      'applianceOperatorNewAppliancesNetIncome',
      '-'
    )
    const totalCapexAssignedToAppliance = _.get(stats, 'totalCapexAssignedToAppliance', '-')
    const applianceCapexAssignedToAppliance = _.get(stats, 'applianceCapexAssignedToAppliance', '-')
    const ancillaryCapexAssignedToAppliance = _.get(stats, 'ancillaryCapexAssignedToAppliance', '-')
    const applianceOwnerRoi = _.get(stats, 'applianceOwnerRoi', '-')
    const applianceOwnerPayback = _.get(stats, 'applianceOwnerPayback', '-')
    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                CapEx - New Appliances{' '}
                <HelperPopup content="Upfront investment for all enabled appliances assigned to the appliance operator. This does not include appliances that were represented in the original HOMER file." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {applianceCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                CapEx - Ancillary Equipment{' '}
                <HelperPopup content="Upfront investment for all ancillary equipment assigned to the appliance operator. Only enabled ancillary equipment is counted." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {ancillaryCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                CapEx - New Appliances & Ancillary{' '}
                <HelperPopup content="Upfront investment for all enabled appliances and ancillary equipment assigned to the appliance operator." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {totalCapexAssignedToAppliance}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Electricity Costs{' '}
                <HelperPopup content="Appliance operator's electricity cost from all enabled appliances and any enabled ancillary equipment. This does not take into account cost from loads represented in the original HOMER file." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {newAppliancesApplianceOwnerOpex}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Appliance-Related Revenue{' '}
                <HelperPopup content="Appliance operator's revenue from enabled appliances." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {yearlyProductionUnitsRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                OpEx{' '}
                <HelperPopup content="Appliance operator's operating expenses to cover any new enabled appliances and ancillary equipment. This is the same as the electricity cost for the appliances." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {newAppliancesApplianceOwnerOpex}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Net Income{' '}
                <HelperPopup content="Appliance operator's net income from enabled appliances. It is calculated by subtracting the OpEx from the yearly revenue from the appliances." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {applianceOperatorNewAppliancesNetIncome}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                ROI{' '}
                <HelperPopup content="Appliance operator's return on investment from enabled appliances and ancillary equipment. It is calculated by dividing the net income by the total CapEx." />
              </Table.Cell>
              <Table.Cell textAlign="right">
                {applianceOwnerRoi} {_.isFinite(applianceOwnerRoi) ? '%' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Payback{' '}
                <HelperPopup content="Appliance operator's payback, in years, from enabled appliances and ancillary equipment. It is calculated by dividing the total CapEx by the net income." />
              </Table.Cell>
              <Table.Cell textAlign="right">{applianceOwnerPayback} yrs</Table.Cell>
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
    const { yearlyProductionUnits, productionUnitType, newAppliancesYearlyKwh } = summaryStats
    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>New Appliances Electricity Consumption</Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesYearlyKwh || 0} kWh</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Units Produced</Table.Cell>
              <Table.Cell textAlign="right">
                {yearlyProductionUnits === 'Multiple'
                  ? 'Multiple'
                  : `${yearlyProductionUnits} ${productionUnitType}`}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
