import React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Loader } from 'semantic-ui-react'

export const FinalLossTable = inject('store')(
  observer(({ store, gridName }) => {
    const {
      batteryIsTrained,
      batteryFinalTrainSetLoss,
      batteryValidationSetLoss,
      batteryTestSetLoss,
    } = store[gridName]
    return (
      <Table compact="very" celled size="small" basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Final train-set loss</Table.Cell>
            <Table.Cell>
              {batteryIsTrained ? batteryFinalTrainSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Final validation-set loss</Table.Cell>
            <Table.Cell>
              {batteryIsTrained ? batteryValidationSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Test-set loss</Table.Cell>
            <Table.Cell>
              {batteryIsTrained ? batteryTestSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)

export const EpochProgressTable = inject('store')(
  observer(({ store, gridName }) => {
    return (
      <Table compact="very" celled size="small" basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Model Name</Table.Cell>
            <Table.Cell>{store[gridName].batteryModelName}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Target</Table.Cell>
            <Table.Cell>
              <em>{store[gridName].batteryTargetColumn}</em>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Features</Table.Cell>
            <Table.Cell>
              <em>{store[gridName].batteryTrainingColumns.join(', ')}</em>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Epoch</Table.Cell>
            <Table.Cell>
              {store[gridName].batteryCurrentEpoch + 1}: {store[gridName].batteryMaxEpochCount}{' '}
              epoch max or validation loss of {store[gridName].batteryModelStopLoss}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Time</Table.Cell>
            <Table.Cell>{store[gridName].batteryTrainingTimeDisplay}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)
