import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Segment, Header } from 'semantic-ui-react'
import { GridOperatorEconomicSummary, GridOperatorTechnicalSummary } from './GridOperatorSummary'
import {
  ApplianceOperatorTechnicalSummary,
  ApplianceOperatorEconomicSummary,
} from './ApplianceOperatorSummary'
import { EconomicInputs, TechnicalInputs } from './ModelInputs'

class Summary extends Component {
  render() {
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <h3>Calculation Inputs</h3>
            <Segment>
              <Header as="h4">Economic Inputs</Header>
              <EconomicInputs />
            </Segment>
            <Segment>
              <Header as="h4">Technical Inputs</Header>
              <TechnicalInputs />
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <h3>Grid Operator Annual Summary</h3>
            <Segment>
              <GridOperatorEconomicSummary />
            </Segment>
            <Segment>
              <GridOperatorTechnicalSummary />
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <h3>Appliance Operator Annual Summary</h3>
            <Segment>
              <ApplianceOperatorEconomicSummary />
            </Segment>
            <Segment>
              <ApplianceOperatorTechnicalSummary />
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(Summary))
