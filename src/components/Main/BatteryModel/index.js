import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Button } from 'semantic-ui-react'
import LossChart from 'components/Charts/LossChart'
import ActualVsPredicted from 'components/Charts/ActualVsPredicted'
import LoaderSpinner from 'components/Elements/Loader'
import { FinalLossTable, EpochProgressTable } from 'components/Elements/MLResultsTables'
import { greyColors } from 'utils/constants'
const headerStyle = { color: greyColors[1], fontWeight: '200', fontSize: '16px' }

class BatteryModel extends React.Component {
  retrainModelClick = event => {
    event.preventDefault()
    this.props.store.grid.retrainBatteryModel()
  }

  render() {
    const { calculatedColumns, grid } = this.props.store
    const {
      batteryModelName,
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
      batteryModelStopLoss,
    } = grid
    if (_.isEmpty(calculatedColumns)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <h2 style={{ display: 'inline-block', marginBottom: '8px' }}>
                Battery Charge & Discharge Model
              </h2>
              <Button
                basic
                compact
                size="tiny"
                color="blue"
                onClick={this.retrainModelClick}
                style={{ verticalAlign: 'top', marginLeft: '1rem', marginTop: '4px' }}>
                Re-Train model
              </Button>
              <p style={headerStyle}>
                Use machine learning to recreate the kinetic battery model based on the HOMER file.
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
                batteryModelStopLoss={batteryModelStopLoss}
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
    const { batteryTrainingState } = store.grid
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
