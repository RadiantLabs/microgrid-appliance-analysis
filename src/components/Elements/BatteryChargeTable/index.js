import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'

const BatteryChargeTable = ({ grid }) => {
  const {
    batteryMaxSoC,
    batteryMinSoC,
    batteryMaxEnergyContent,
    batteryMinEnergyContent,
    batteryEstimatedMaxEnergyContent,
    batteryEstimatedMinEnergyContent,
  } = grid

  const maxSocIsValid = batteryMaxEnergyContent === batteryEstimatedMaxEnergyContent
  const minSocIsValid = batteryMinEnergyContent === batteryEstimatedMinEnergyContent

  return (
    <Table basic="very">
      <Table.Body>
        <Table.Row>
          <Table.Cell>Battery Max Energy Content</Table.Cell>
          <Table.Cell textAlign="right">
            {batteryMaxEnergyContent}
            {batteryMaxEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Battery Min Energy Content</Table.Cell>
          <Table.Cell textAlign="right">
            {batteryMinEnergyContent}
            {batteryMinEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Estimated Battery Max Energy Content</Table.Cell>
          <Table.Cell textAlign="right">
            {batteryEstimatedMaxEnergyContent}
            {batteryEstimatedMaxEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Estimated Battery Min Energy Content</Table.Cell>
          <Table.Cell textAlign="right">
            {batteryEstimatedMinEnergyContent}
            {batteryEstimatedMinEnergyContent && ' kWh'}
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell width={9}>Battery Max State of Charge</Table.Cell>
          <Table.Cell width={7} textAlign="right">
            {maxSocIsValid ? batteryMaxSoC : 'N/A'}
            {maxSocIsValid && batteryMaxSoC ? ' %' : ''}
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Battery Min State of Charge</Table.Cell>
          <Table.Cell textAlign="right">
            {minSocIsValid ? batteryMinSoC : 'N/A'}
            {minSocIsValid && batteryMinSoC ? ' %' : ''}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(BatteryChargeTable))
