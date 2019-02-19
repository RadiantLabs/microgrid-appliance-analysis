import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Segment } from 'semantic-ui-react'
import GridOperatorSummary from './GridOperatorSummary'
import ApplianceOperatorSummary from './ApplianceOperatorSummary'
import ModelInputs from './ModelInputs'

class Summary extends Component {
  render() {
    return (
      <div>
        {/* Grid for Inputs, Grid Operator Summary and Appliance Operator Summary */}
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <h3>Technical Inputs</h3>
                <ModelInputs />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Grid Operator Annual Summary</h3>
                <GridOperatorSummary />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Appliance Operator Annual Summary</h3>
                <ApplianceOperatorSummary />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <h3>Economic Inputs</h3>
              </Segment>
            </Grid.Column>
            <Grid.Column />
            <Grid.Column />
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(Summary))
