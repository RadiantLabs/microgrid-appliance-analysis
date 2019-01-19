import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'
import { Grid } from 'semantic-ui-react'
// import CurveFittingChart from '../Charts/CurveFittingChart'
import LossChart from '../Charts/LossChart'
import ActualVsPredicted from '../Charts/ActualVsPredicted'
import LoaderSpinner from '../Elements/Loader'
// import { greyColors } from '../../utils/constants'
import {
  // WeightsMagnitudeTable,
  // ModelParametersTable,
  FinalLossTable,
} from '../Elements/MLResultsTables'

class BatteryCharacterization extends React.Component {
  render() {
    const {
      calculatedColumns,
      batteryModel,
      batteryInputTensorShape,
      batteryPlottablePredictionVsActualData,
      batteryEpochCount,
      batteryCurrentEpoch,
      batteryTrainingState,
      batteryFinalTrainSetLoss,
      batteryValidationSetLoss,
      batteryTestSetLoss,
      batteryPlottableReferenceLine,
    } = this.props.store
    if (_.isEmpty(calculatedColumns)) {
      return <LoaderSpinner />
    }
    if (batteryModel) {
      batteryModel.predict(tf.tensor([1, 0.7], batteryInputTensorShape)).print()
      batteryModel.predict(tf.tensor([1, 0.7], batteryInputTensorShape)).print()
      batteryModel.predict(tf.tensor([-0.5576, 96.4657], batteryInputTensorShape)).print()
    }
    return (
      <div>
        <h2>Battery Charge & Discharge Characterization</h2>
        <p>Use machine learning to create a model of the battery State of Charge based on:</p>
        <ul>
          <li>Production Load Difference (Total generated power - Load Served)</li>
          <li>Previous Battery State of Charge</li>
        </ul>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <h3>Training Progress</h3>
              <code>{/* {_.first(trainBatteryModel)} */}</code>
              <LossChartWrapper />
            </Grid.Column>
            <Grid.Column>
              <h4>
                Epoch {batteryCurrentEpoch + 1} of {batteryEpochCount} completed
              </h4>
              <FinalLossTable
                isTrained={batteryTrainingState === 'Trained'}
                finalTrainSetLoss={batteryFinalTrainSetLoss}
                finalValidationSetLoss={batteryValidationSetLoss}
                testSetLoss={batteryTestSetLoss}
              />
              <h3>Weights by absolute magnitude</h3>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <h3>Predicted vs. Actual</h3>
              <ActualVsPredicted
                data={batteryPlottablePredictionVsActualData}
                referenceLineData={batteryPlottableReferenceLine}
                isTraining={_.isEmpty(batteryPlottablePredictionVsActualData)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryCharacterization))

const LossChartWrapper = inject('store')(
  observer(({ store }) => {
    const trainingState = store.batteryTrainingState
    if (trainingState === 'None') {
      return null
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <LossChart trainLogs={store.batteryTrainLogs} />
      </div>
    )
  })
)
