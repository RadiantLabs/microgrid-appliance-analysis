import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid } from 'semantic-ui-react'
// import CurveFittingChart from '../Charts/CurveFittingChart'
import LossChart from '../Charts/LossChart'
import LoaderSpinner from '../Elements/Loader'
// import { greyColors } from '../../utils/constants'
import {
  // WeightsMagnitudeTable,
  // ModelParametersTable,
  FinalLossTable,
} from '../Elements/MLResultsTables'

class BatteryCharacterization extends React.Component {
  render() {
    const { calculatedColumns, activeHomer } = this.props.store
    if (_.isEmpty(calculatedColumns)) {
      return <LoaderSpinner />
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
          <Grid.Column>
            <h3>Training Progress</h3>
            <code>{/* {_.first(trainBatteryModel)} */}</code>
            <LossChartWrapper />
          </Grid.Column>
          <Grid.Column>Predicted vs. Actual</Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryCharacterization))

const LossChartWrapper = inject('store')(
  observer(props => {
    const { store, modelName } = props
    const { batteryEpochCount, batteryCurrentEpoch } = store
    const trainingState = store.batteryTrainingState
    if (trainingState === 'None') {
      return null
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <LossChart modelName="linear" trainLogs={store.trainLogs[modelName]} />
        <h4>
          Epoch {batteryCurrentEpoch + 1} of {batteryEpochCount} completed
        </h4>
        <FinalLossTable
          isTrained={trainingState === 'Trained'}
          finalTrainSetLoss={store.finalTrainSetLoss[modelName]}
          finalValidationSetLoss={store.finalValidationSetLoss[modelName]}
          testSetLoss={store.testSetLoss[modelName]}
        />
      </div>
    )
  })
)
