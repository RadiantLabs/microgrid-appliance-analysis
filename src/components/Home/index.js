import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Segment } from 'semantic-ui-react'
import GridOperatorSummary from './GridOperatorSummary'
import ApplianceOperatorSummary from './ApplianceOperatorSummary'
import ModelInputs from './ModelInputs'
import FileChoosers from './FileChoosers'
import AncillaryEquipment from './AncillaryEquipment'

class Home extends Component {
  render() {
    return (
      <div>
        {/* Grid for Selecting HOMER and Appliance usage profiles */}
        <FileChoosers />

        {/* Grid for Inputs, Grid Operator Summary and Appliance Operator Summary */}
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <h3>Model Inputs</h3>
                <ModelInputs />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Grid Operator Summary</h3>
                <GridOperatorSummary />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Appliance Operator Summary</h3>
                <ApplianceOperatorSummary />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <h3>Ancillary Equipment Options</h3>
                <AncillaryEquipment />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(Home))
