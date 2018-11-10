import * as React from 'react'
import { Grid, Segment } from 'semantic-ui-react'
import ResultsSection from './ResultsSection'
import GridOperatorSummary from './GridOperatorSummary'

const Home = () => (
  <Grid columns="equal">
    <Grid.Row>
      <Grid.Column>
        <Segment>
          <h3>Col 1</h3>
          <p>Pellentesque habitant morbi tristique senectus.</p>
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
          <p>Pellentesque habitant morbi tristique senectus.</p>
        </Segment>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column>
        <ResultsSection />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default Home
