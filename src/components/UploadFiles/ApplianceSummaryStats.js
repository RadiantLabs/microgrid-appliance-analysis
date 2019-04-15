import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'

export const ApplianceSummaryStats = inject('store')(
  observer(({ store }) => {
    const {
      yearlyApplianceLoad,
      yearlyProductionUnits,
      yearlyProductionUnitsRevenue,
    } = store.viewedAppliance.applianceSummaryStats
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Summary Stat</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
            <Table.HeaderCell>How it was calculated</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Yearly Appliance Load</Table.Cell>
            <Table.Cell textAlign="right">{_.round(yearlyApplianceLoad) || ''} kWh</Table.Cell>
            <Table.Cell>
              kW Factor * Nominal Power * Duty Cycle Derate Factor (summed over year)
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Yearly Production Units</Table.Cell>
            <Table.Cell textAlign="right">{_.round(yearlyProductionUnits) || ''}</Table.Cell>
            <Table.Cell>
              Appliance Load * Appliance Units of Production per kWh (summed over year)
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Yearly Production Units Revenue</Table.Cell>
            <Table.Cell textAlign="right">
              ${_.round(yearlyProductionUnitsRevenue) || ''}
            </Table.Cell>
            <Table.Cell>
              Revenue Per Production Units * Production Units (summed over year)
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)
