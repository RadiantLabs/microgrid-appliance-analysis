import React from 'react'
import _ from 'lodash'
import { Table, Header, Loader } from 'semantic-ui-react'

export const WeightsMagnitudeTable = ({ weights }) => {
  return (
    <Table basic="very" compact="very">
      <Table.Body>
        {_.map(weights, ({ description, value }) => {
          return (
            <Table.Row key={description}>
              <Table.Cell>{description}</Table.Cell>
              <Table.Cell textAlign="right">
                <Header as="h5" color={value > 0 ? 'green' : 'red'}>
                  {value}
                </Header>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

export const ModelParametersTable = ({
  NUM_EPOCHS,
  BATCH_SIZE,
  LEARNING_RATE,
  numFeatures,
  averagePrice,
  baselineLoss,
}) => {
  return (
    <Table compact="very" celled size="small" basic="very" collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Number of Epochs</Table.Cell>
          <Table.Cell>Batch Size</Table.Cell>
          <Table.Cell>Learning Rate</Table.Cell>
          <Table.Cell>Number of Features</Table.Cell>
          <Table.Cell>Average Home Price</Table.Cell>
          <Table.Cell>Baseline Loss (meanSquaredError)</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{NUM_EPOCHS ? NUM_EPOCHS : <Loader active inline size="mini" />}</Table.Cell>
          <Table.Cell>{BATCH_SIZE ? BATCH_SIZE : <Loader active inline size="mini" />}</Table.Cell>
          <Table.Cell>
            {LEARNING_RATE ? LEARNING_RATE : <Loader active inline size="mini" />}
          </Table.Cell>
          <Table.Cell>
            {numFeatures ? numFeatures : <Loader active inline size="mini" />}
          </Table.Cell>
          <Table.Cell>
            {averagePrice ? averagePrice : <Loader active inline size="mini" />}
          </Table.Cell>
          <Table.Cell>
            {baselineLoss ? baselineLoss : <Loader active inline size="mini" />}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export const FinalLossTable = ({
  isTrained,
  finalTrainSetLoss,
  finalValidationSetLoss,
  testSetLoss,
}) => {
  return (
    <Table compact="very" celled size="small" basic="very">
      <Table.Body>
        <Table.Row>
          <Table.Cell>Final train-set loss</Table.Cell>
          <Table.Cell>
            {isTrained ? finalTrainSetLoss : <Loader active inline size="mini" />}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Final validation-set loss</Table.Cell>
          <Table.Cell>
            {isTrained ? finalValidationSetLoss : <Loader active inline size="mini" />}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Test-set loss</Table.Cell>
          <Table.Cell>{isTrained ? testSetLoss : <Loader active inline size="mini" />}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export const EpochProgressTable = ({
  isTrained,
  batteryModelName,
  batteryCurrentEpoch,
  batteryEpochCount,
  batteryTrainingTimeDisplay,
  batteryTargetColumn,
  batteryTrainingColumns,
  batteryModelStopLoss,
}) => {
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
            {batteryCurrentEpoch + 1}: {batteryEpochCount} epoch max or validation loss of{' '}
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
}
