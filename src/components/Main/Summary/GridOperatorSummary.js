import * as React from 'react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { UnmetLoadHelperPopup } from '../../../components/Elements/HelperPopup/UnmetLoadHelperPopup'

export const GridOperatorEconomicSummary = inject('store')(
  observer(({ store }) => {
    const { summaryStats: stats } = store
    const newApplianceGridRevenue = _.get(stats, 'newApplianceGridRevenue')
    const applianceCapexAssignedToGrid = _.get(stats, 'applianceCapexAssignedToGrid')
    const newApplianceElectricityCost = _.get(stats, 'newApplianceElectricityCost')
    const newApplianceUnmetLoadCost = _.get(stats, 'newApplianceUnmetLoadCost', '-')
    const newApplianceNetGridRevenue = _.get(stats, 'newApplianceNetGridRevenue', '-')
    return (
      <div>
        <Header as="h4">Economic Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>CAPEX costs (due to new appliance)</Table.Cell>
              <Table.Cell>${applianceCapexAssignedToGrid}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>OPEX costs (due to new appliance)</Table.Cell>
              <Table.Cell>${newApplianceElectricityCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Electricity Sales (from new appliance)</Table.Cell>
              <Table.Cell>${newApplianceGridRevenue}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Grid ROI</Table.Cell>
              <Table.Cell />
            </Table.Row>
            <Table.Row>
              <Table.Cell>Simple Payback</Table.Cell>
              <Table.Cell />
            </Table.Row>
            <Table.Row>
              <Table.Cell>New appliance unmet load cost</Table.Cell>
              <Table.Cell>${newApplianceUnmetLoadCost}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>New appliance net revenue</Table.Cell>
              <Table.Cell>${newApplianceNetGridRevenue}</Table.Cell>
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
    const newApplianceYearlyKwh = _.get(stats, 'newApplianceYearlyKwh', '-')

    // Original unmet loads
    const originalUnmetLoadCount = _.get(stats, 'originalUnmetLoadCount', '-')
    const originalUnmetLoadCountPercent = _.get(stats, 'originalUnmetLoadCountPercent', '-')
    const originalUnmetLoadSum = _.get(stats, 'originalUnmetLoadSum', '-')

    // Additional unmet loads
    const additionalUnmetLoadCount = _.get(stats, 'additionalUnmetLoadCount', '-')
    const additionalUnmetLoadCountPercent = _.get(stats, 'additionalUnmetLoadCountPercent', '-')
    const additionalUnmetLoadSum = _.get(stats, 'additionalUnmetLoadSum', '-')

    // Total unmet loads
    const newTotalUnmetLoadCount = _.get(stats, 'newTotalUnmetLoadCount', '-')
    const newTotalUnmetLoadCountPercent = _.get(stats, 'newTotalUnmetLoadCountPercent', '-')
    const newTotalUnmetLoadSum = _.get(stats, 'newTotalUnmetLoadSum', '-')

    return (
      <div>
        <Header as="h4">Technical Outputs</Header>
        <Table basic="very" celled collapsing compact>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Appliance Energy Consumption</Table.Cell>
              <Table.Cell>{newApplianceYearlyKwh} kWh</Table.Cell>
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
              <Table.Cell>Original unmet load</Table.Cell>
              <Table.Cell>{originalUnmetLoadCount}</Table.Cell>
              <Table.Cell>{originalUnmetLoadSum}</Table.Cell>
              <Table.Cell>{originalUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Additional unmet load</Table.Cell>
              <Table.Cell>{additionalUnmetLoadCount}</Table.Cell>
              <Table.Cell>{additionalUnmetLoadSum}</Table.Cell>
              <Table.Cell>{additionalUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Total unmet load</Table.Cell>
              <Table.Cell>{newTotalUnmetLoadCount}</Table.Cell>
              <Table.Cell>{newTotalUnmetLoadSum}</Table.Cell>
              <Table.Cell>{newTotalUnmetLoadCountPercent}%</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  })
)
