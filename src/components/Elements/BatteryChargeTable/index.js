import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'

const BatteryChargeTable = ({ store, gridStatus }) => {
  const { batteryMaxSoC, batteryMinSoC, batteryMaxEnergyContent, batteryMinEnergyContent } = store[
    gridStatus
  ]
  return (
    <Table basic="very" celled>
      <Table.Body>
        <Table.Row>
          <Table.Cell width={9}>Battery Max State of Charge</Table.Cell>
          <Table.Cell width={7}>
            {batteryMaxSoC}
            {batteryMaxSoC && ' %'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Min State of Charge</Table.Cell>
          <Table.Cell>
            {batteryMinSoC}
            {batteryMinSoC && ' %'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Max Energy Content</Table.Cell>
          <Table.Cell>
            {batteryMaxEnergyContent}
            {batteryMaxEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Min Energy Content</Table.Cell>
          <Table.Cell>
            {batteryMinEnergyContent}
            {batteryMinEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(BatteryChargeTable))
