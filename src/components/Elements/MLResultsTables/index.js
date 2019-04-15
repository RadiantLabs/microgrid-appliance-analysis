import React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Loader } from 'semantic-ui-react'

export const FinalLossTable = inject('store')(
  observer(({ grid }) => {
    const {
      batteryIsTrained,
      batteryFinalTrainSetLoss,
      batteryValidationSetLoss,
      batteryTestSetLoss,
    } = grid
    return (
      <Table compact="very" size="small" basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Final train-set loss</Table.Cell>
            <Table.Cell textAlign="right">
              {batteryIsTrained ? batteryFinalTrainSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Final validation-set loss</Table.Cell>
            <Table.Cell textAlign="right">
              {batteryIsTrained ? batteryValidationSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Test-set loss</Table.Cell>
            <Table.Cell textAlign="right">
              {batteryIsTrained ? batteryTestSetLoss : <Loader active inline size="mini" />}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)

export const EpochProgressTable = inject('store')(
  observer(({ grid }) => {
    const {
      batteryModelName,
      batteryTargetColumn,
      batteryTrainingColumns,
      batteryCurrentEpoch,
      batteryMaxEpochCount,
      batteryModelStopLoss,
      batteryTrainingTimeDisplay,
    } = grid
    return (
      <Table compact="very" celled size="small" basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Model Name</Table.Cell>
            <Table.Cell>{batteryModelName}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Target</Table.Cell>
            <Table.Cell>
              <em>{batteryTargetColumn}</em>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Features</Table.Cell>
            <Table.Cell>
              <em>{batteryTrainingColumns.join(', ')}</em>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Epoch</Table.Cell>
            <Table.Cell>
              {batteryCurrentEpoch + 1}: {batteryMaxEpochCount} epoch max or validation loss of{' '}
              {batteryModelStopLoss}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Training Time</Table.Cell>
            <Table.Cell>{batteryTrainingTimeDisplay}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)
