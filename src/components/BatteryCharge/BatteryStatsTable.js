import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'

const BatteryStatsTable = ({ stats }) => {
  const {
    effectiveMinBatteryEnergyContent,
    maxBatteryEnergyContent,
    minBatteryEnergyContent,
    minbatterySOC,
    maxbatterySOC,
  } = stats
  return (
    <div>
      <Table
        basic="very"
        // selectable
        // celled
        collapsing
        // compact="very"
        size="small"
        style={{ float: 'right' }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <strong>Max Battery State of Charge</strong>
            </Table.Cell>
            <Table.Cell>{_.round(maxbatterySOC, 4)} %</Table.Cell>

            <Table.Cell>
              <strong>Max Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(maxBatteryEnergyContent, 4)}</Table.Cell>

            <Table.Cell>
              <strong>Effective Min Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(effectiveMinBatteryEnergyContent, 4)}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <strong>Min Battery State of Charge</strong>
            </Table.Cell>
            <Table.Cell>{_.round(minbatterySOC, 4)} %</Table.Cell>

            <Table.Cell>
              <strong>Min Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(minBatteryEnergyContent, 4)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}

export default inject('store')(observer(BatteryStatsTable))
