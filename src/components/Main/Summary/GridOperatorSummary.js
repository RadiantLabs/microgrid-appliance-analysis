import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { UnmetLoadHelperPopup } from '../../../components/Elements/HelperPopup/UnmetLoadHelperPopup'

export const GridOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    const newAppliancesGridRevenue = _.get(stats, 'newAppliancesGridRevenue', '-')
    const totalCapexAssignedToGrid = _.get(stats, 'totalCapexAssignedToGrid', '-')
    const applianceCapexAssignedToGrid = _.get(stats, 'applianceCapexAssignedToGrid', '-')
    const ancillaryCapexAssignedToGrid = _.get(stats, 'ancillaryCapexAssignedToGrid', '-')
    const newAppliancesWholesaleElectricityCost = _.get(
      stats,
      'newAppliancesWholesaleElectricityCost',
      '-'
    )
    const gridOperatorNewAppliancesOpex = _.get(stats, 'gridOperatorNewAppliancesOpex', '-')
    const newAppliancesUnmetLoadCost = _.get(stats, 'newAppliancesUnmetLoadCost', '-')
    const gridOperatorNewAppliancesNetIncome = _.get(
      stats,
      'gridOperatorNewAppliancesNetIncome',
      '-'
    )
    const gridOwnerRoi = _.get(stats, 'gridOwnerRoi', '-')
    const gridOwnerPayback = _.get(stats, 'gridOwnerPayback', '-')
    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>CapEx - New Appliances</Table.Cell>
              <Table.Cell>$ {applianceCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CapEx - Ancillary Equipment</Table.Cell>
              <Table.Cell>$ {ancillaryCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CapEx - New Appliances & Ancillary</Table.Cell>
              <Table.Cell>$ {totalCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Electricity Revenue - New Appliances</Table.Cell>
              <Table.Cell>$ {newAppliancesGridRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Wholesale Electricity Costs - New Appliances</Table.Cell>
              <Table.Cell>$ {newAppliancesWholesaleElectricityCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Unmet Load Cost - New Appliances</Table.Cell>
              <Table.Cell>$ {newAppliancesUnmetLoadCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>OpEx - New Appliances</Table.Cell>
              <Table.Cell>$ {gridOperatorNewAppliancesOpex}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Net Income - New Appliances</Table.Cell>
              <Table.Cell>$ {gridOperatorNewAppliancesNetIncome}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>ROI - New Appliances</Table.Cell>
              <Table.Cell>
                {gridOwnerRoi} {_.isFinite(gridOwnerRoi) ? '%' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Payback - New Appliances</Table.Cell>
              <Table.Cell>
                {gridOwnerPayback} {_.isFinite(gridOwnerPayback) ? 'yrs' : ''}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)

export const GridOperatorTechnicalSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store

    // Financials
    const newAppliancesYearlyKwh = _.get(stats, 'newAppliancesYearlyKwh', '-')

    // Original unmet loads
    const originalUnmetLoadCount = _.get(stats, 'originalUnmetLoadCount', '-')
    const originalUnmetLoadCountPercent = _.get(stats, 'originalUnmetLoadCountPercent', '-')
    const originalUnmetLoadSum = _.get(stats, 'originalUnmetLoadSum', '-')

    // Total unmet loads
    const totalUnmetLoadCount = _.get(stats, 'totalUnmetLoadCount', '-')
    const totalUnmetLoadCountPercent = _.get(stats, 'totalUnmetLoadCountPercent', '-')
    const totalUnmetLoadSum = _.get(stats, 'totalUnmetLoadSum', '-')

    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Appliance Energy Consumption</Table.Cell>
              <Table.Cell>{newAppliancesYearlyKwh} kWh</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        {/* Unmet Load Table */}
        <Table definition basic compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>
                Count <em>hrs/year</em> <UnmetLoadHelperPopup />
              </Table.HeaderCell>
              <Table.HeaderCell>
                Sum <em>kWh</em>
              </Table.HeaderCell>
              <Table.HeaderCell>Percent of Year</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Original Unmet Load</Table.Cell>
              <Table.Cell>{originalUnmetLoadCount}</Table.Cell>
              <Table.Cell>{originalUnmetLoadSum}</Table.Cell>
              <Table.Cell>{originalUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Total Unmet Load</Table.Cell>
              <Table.Cell>{totalUnmetLoadCount}</Table.Cell>
              <Table.Cell>{totalUnmetLoadSum}</Table.Cell>
              <Table.Cell>{totalUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
