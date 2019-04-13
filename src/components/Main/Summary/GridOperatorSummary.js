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
    const newUnmetLoadCost = _.get(stats, 'newUnmetLoadCost', '-')
    const newAppliancesGridNetIncome = _.get(stats, 'newAppliancesGridNetIncome', '-')
    const gridOwnerRoi = _.get(stats, 'gridOwnerRoi', '-')
    const gridOwnerPayback = _.get(stats, 'gridOwnerPayback', '-')
    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>CAPEX (Combined appliance & ancillary)</Table.Cell>
              <Table.Cell>$ {totalCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CAPEX (from appliance)</Table.Cell>
              <Table.Cell>$ {applianceCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CAPEX (from ancillary equipment)</Table.Cell>
              <Table.Cell>$ {ancillaryCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>OPEX costs (due to new appliance)</Table.Cell>
              <Table.Cell>$ {newAppliancesWholesaleElectricityCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Electricity Sales (from new appliance)</Table.Cell>
              <Table.Cell>$ {newAppliancesGridRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Grid ROI</Table.Cell>
              <Table.Cell>
                {gridOwnerRoi} {_.isFinite(gridOwnerRoi) ? '%' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Payback</Table.Cell>
              <Table.Cell>
                {gridOwnerPayback} {_.isFinite(gridOwnerPayback) ? 'yrs' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Total unmet load cost
                <br />
                (new appliances + original)
              </Table.Cell>
              <Table.Cell>$ {newUnmetLoadCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Net Income for New Appliances</Table.Cell>
              <Table.Cell>$ {newAppliancesGridNetIncome}</Table.Cell>
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
    const newUnmetLoadCount = _.get(stats, 'newUnmetLoadCount', '-')
    const newUnmetLoadCountPercent = _.get(stats, 'newUnmetLoadCountPercent', '-')
    const newUnmetLoadSum = _.get(stats, 'newUnmetLoadSum', '-')

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
              <Table.Cell>New Unmet Load</Table.Cell>
              <Table.Cell>{newUnmetLoadCount}</Table.Cell>
              <Table.Cell>{newUnmetLoadSum}</Table.Cell>
              <Table.Cell>{newUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
