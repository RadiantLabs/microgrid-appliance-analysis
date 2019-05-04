import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { HelperPopup } from '../../../components/Elements/HelperPopup'
import { UnmetLoadHelperModal } from '../../../components/Elements/UnmetLoadHelperModal'

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
        <Table basic="very" collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                CapEx - New Appliances{' '}
                <HelperPopup content="Upfront investment for all enabled appliances assigned to the grid operator. This does not include appliances that were represented in the original HOMER file." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {applianceCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                CapEx - Ancillary Equipment{' '}
                <HelperPopup content="Upfront investment for all ancillary equipment assigned to the grid operator. Only enabled ancillary equipment is counted." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {ancillaryCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                CapEx - New Appliances & Ancillary{' '}
                <HelperPopup content="Upfront investment for all enabled appliances and ancillary equipment assigned to grid operator." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {totalCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Electricity Revenue{' '}
                <HelperPopup content="Grid operator's electricity revenue from all enabled appliances and any enabled ancillary equipment. This does not take into account revenue from loads represented in the original HOMER file." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {newAppliancesGridRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Wholesale Electricity Costs{' '}
                <HelperPopup content="Grid operator's wholesale electricity cost from all enabled appliances and any enabled ancillary equipment. This does not take into account costs from loads represented in the original HOMER file." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {newAppliancesWholesaleElectricityCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Unmet Load Cost{' '}
                <HelperPopup content="Grid operator's cost to cover the unmet load. This can happen when the battery is empty and production can't keep up with demand. Unmet load could be met by a generator, for example, and may have different costs than normal production." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {newAppliancesUnmetLoadCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                OpEx{' '}
                <HelperPopup content="Grid operator's operating expenses to cover any new enabled appliances and ancillary equipment. It is calculated by adding up the wholesale electricity costs and the unmet load costs." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {gridOperatorNewAppliancesOpex}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Net Income{' '}
                <HelperPopup content="Grid operator's net income from enabled appliances and ancillary equipment. It is calculated by subtracting the OpEx from the revenue from the new appliances." />
              </Table.Cell>
              <Table.Cell textAlign="right">$ {gridOperatorNewAppliancesNetIncome}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                ROI{' '}
                <HelperPopup content="Grid operator's return on investment from enabled appliances and ancillary equipment. It is calculated by dividing the net income by the total CapEx for the appliances and ancillary equipment." />
              </Table.Cell>
              <Table.Cell textAlign="right">
                {gridOwnerRoi} {_.isFinite(gridOwnerRoi) ? '%' : ''}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Payback{' '}
                <HelperPopup content="Grid operator's payback, in years, from enabled appliances and ancillary equipment. It is calculated by dividing the CapEx by the net income." />
              </Table.Cell>
              <Table.Cell textAlign="right">{gridOwnerPayback} yrs</Table.Cell>
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
    const newAppliancesLoadSum = _.get(stats, 'newAppliancesLoadSum', '-')

    // Unmet loads
    const originalUnmetLoadCount = _.get(stats, 'originalUnmetLoadCount', '-')
    const originalUnmetLoadCountPercent = _.get(stats, 'originalUnmetLoadCountPercent', '-')
    const originalUnmetLoadSum = _.get(stats, 'originalUnmetLoadSum', '-')
    const newAppliancesUnmetLoadCount = _.get(stats, 'newAppliancesUnmetLoadCount', '-')
    const newAppliancesUnmetLoadSum = _.get(stats, 'newAppliancesUnmetLoadSum', '-')
    const newAppliancesUnmetLoadCountPercent = _.get(
      stats,
      'newAppliancesUnmetLoadCountPercent',
      '-'
    )
    const totalUnmetLoadCount = _.get(stats, 'totalUnmetLoadCount', '-')
    const totalUnmetLoadCountPercent = _.get(stats, 'totalUnmetLoadCountPercent', '-')
    const totalUnmetLoadSum = _.get(stats, 'totalUnmetLoadSum', '-')

    // Excess Production
    const originalExcessProductionCount = _.get(stats, 'originalExcessProductionCount', '-')
    const originalExcessProductionCountPercent = _.get(
      stats,
      'originalExcessProductionCountPercent',
      '-'
    )
    const originalExcessProductionSum = _.get(stats, 'originalExcessProductionSum', '-')
    const newAppliancesExcessProductionCount = _.get(
      stats,
      'newAppliancesExcessProductionCount',
      '-'
    )
    const newAppliancesExcessProductionSum = _.get(stats, 'newAppliancesExcessProductionSum', '-')
    const newAppliancesExcessProductionCountPercent = _.get(
      stats,
      'newAppliancesExcessProductionCountPercent',
      '-'
    )
    const totalExcessProductionCount = _.get(stats, 'totalExcessProductionCount', '-')
    const totalExcessProductionCountPercent = _.get(stats, 'totalExcessProductionCountPercent', '-')
    const totalExcessProductionSum = _.get(stats, 'totalExcessProductionSum', '-')

    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>New Appliances Energy Consumption</Table.Cell>
              <Table.Cell>{newAppliancesLoadSum} kWh</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        {/* Unmet Load Table */}
        <Table definition basic compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>
                Count <em>hrs/year</em> <UnmetLoadHelperModal />
              </Table.HeaderCell>
              <Table.HeaderCell>Count Percent of Year</Table.HeaderCell>
              <Table.HeaderCell>
                Sum <em>kWh</em>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Original Unmet Load</Table.Cell>
              <Table.Cell textAlign="right">{originalUnmetLoadCount}</Table.Cell>
              <Table.Cell textAlign="right">{originalUnmetLoadCountPercent}%</Table.Cell>
              <Table.Cell textAlign="right">{originalUnmetLoadSum}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>New Appliances Unmet Load</Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesUnmetLoadCount}</Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesUnmetLoadCountPercent}%</Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesUnmetLoadSum}</Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>Total Unmet Load</Table.Cell>
              <Table.Cell textAlign="right">{totalUnmetLoadCount}</Table.Cell>
              <Table.Cell textAlign="right">{totalUnmetLoadCountPercent}%</Table.Cell>
              <Table.Cell textAlign="right">{totalUnmetLoadSum}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        {/* Excess Production Table */}
        <Table definition basic compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>
                Count <em>hrs/year</em> <UnmetLoadHelperModal />
              </Table.HeaderCell>
              <Table.HeaderCell>Count Percent of Year</Table.HeaderCell>
              <Table.HeaderCell>
                Sum <em>kWh</em>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Original Excess Production</Table.Cell>
              <Table.Cell textAlign="right">{originalExcessProductionCount}</Table.Cell>
              <Table.Cell textAlign="right">{originalExcessProductionCountPercent}%</Table.Cell>
              <Table.Cell textAlign="right">{originalExcessProductionSum}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>New Appliances Excess Production</Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesExcessProductionCount}</Table.Cell>
              <Table.Cell textAlign="right">
                {newAppliancesExcessProductionCountPercent}%
              </Table.Cell>
              <Table.Cell textAlign="right">{newAppliancesExcessProductionSum}</Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell>Total Excess Production</Table.Cell>
              <Table.Cell textAlign="right">{totalExcessProductionCount}</Table.Cell>
              <Table.Cell textAlign="right">{totalExcessProductionCountPercent}%</Table.Cell>
              <Table.Cell textAlign="right">{totalExcessProductionSum}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
