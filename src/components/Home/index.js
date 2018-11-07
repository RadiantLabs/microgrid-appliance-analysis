import * as React from 'react'
import { Grid, Segment } from 'semantic-ui-react'
import ResultsSection from './ResultsSection'

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
          <h3>Col 2</h3>
          <p>Pellentesque habitant morbi tristique senectus.</p>
        </Segment>
      </Grid.Column>
      <Grid.Column>
        <Segment>
          <h3>Col 3</h3>
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
