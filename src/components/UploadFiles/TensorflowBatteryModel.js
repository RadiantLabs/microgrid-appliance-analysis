import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Button, Header } from 'semantic-ui-react'
import LossChart from '../../../components/Charts/LossChart'
import PredictedVsActual from '../../../components/Charts/PredictedVsActual'
import { FinalLossTable, EpochProgressTable } from '../../../components/Elements/MLResultsTables'
import { greyColors } from '../../../utils/constants'

const headerStyle = { color: greyColors[1], fontWeight: '200', fontSize: '16px' }

class TensorflowBatteryModel extends React.Component {
  retrainModelClick = event => {
    event.preventDefault()
    console.log('TODO')
    // this.props.store.activeGrid.retrainBatteryModel()
  }

  render() {
    const { grid } = this.props
    if (!_.isEmpty(grid.fileErrors)) {
      return null
    }
    return (
      <div style={{ marginTop: '2rem' }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header as="h3" style={{ display: 'inline-block', marginBottom: '8px' }}>
                Battery Charge & Discharge Model
              </Header>
              <Button
                basic
                compact
                size="tiny"
                color="blue"
                onClick={this.retrainModelClick}
                style={{ marginTop: '-5px' }}
                floated="right">
                Re-Train Battery Model
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
              <EpochProgressTable grid={grid} />
            </Grid.Column>
            <Grid.Column>
              <FinalLossTable grid={grid} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <h3>Training Progress</h3>
              <LossChart grid={grid} />
            </Grid.Column>
            <Grid.Column>
              <h3>Predicted vs. Actual</h3>
              <PredictedVsActual />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(TensorflowBatteryModel))
