import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'
import { Grid } from 'semantic-ui-react'
// import CurveFittingChart from 'components/Charts/CurveFittingChart'
import LossChart from 'components/Charts/LossChart'
import ActualVsPredicted from 'components/Charts/ActualVsPredicted'
import LoaderSpinner from 'components/Elements/Loader'
import { greyColors } from 'utils/constants'
import { FinalLossTable, EpochProgressTable } from 'components/Elements/MLResultsTables'
const headerStyle = { color: greyColors[1], fontWeight: '200', fontSize: '16px' }

class BatteryModel extends React.Component {
  render() {
    const {
      calculatedColumns,
      batteryModel,
      batteryModelName,
      batteryInputTensorShape,
      batteryPlottablePredictionVsActualData,
      batteryEpochCount,
      batteryCurrentEpoch,
      batteryTrainingState,
      batteryFinalTrainSetLoss,
      batteryValidationSetLoss,
      batteryTestSetLoss,
      batteryPlottableReferenceLine,
      batteryTrainingTimeDisplay,
      batteryTargetColumn,
      batteryTrainingColumns,
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
        <h2>
          Battery Charge & Discharge Model{' '}
          <small style={headerStyle}>
            Use machine learning to recreate the kinetic battery model based on the HOMER file.
          </small>
        </h2>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <EpochProgressTable
                isTrained={batteryTrainingState === 'Trained'}
                batteryModelName={batteryModelName}
                batteryCurrentEpoch={batteryCurrentEpoch}
                batteryEpochCount={batteryEpochCount}
                batteryTrainingTimeDisplay={batteryTrainingTimeDisplay}
                batteryTargetColumn={batteryTargetColumn}
                batteryTrainingColumns={batteryTrainingColumns}
              />
            </Grid.Column>
            <Grid.Column>
              <FinalLossTable
                isTrained={batteryTrainingState === 'Trained'}
                finalTrainSetLoss={batteryFinalTrainSetLoss}
                finalValidationSetLoss={batteryValidationSetLoss}
                testSetLoss={batteryTestSetLoss}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <h3>Training Progress</h3>
              <LossChartWrapper />
            </Grid.Column>
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

export default inject('store')(observer(BatteryModel))

const LossChartWrapper = inject('store')(
  observer(({ store }) => {
    const { batteryTrainingState } = store
    if (batteryTrainingState === 'None') {
      return null
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <LossChart />
      </div>
    )
  })
)
