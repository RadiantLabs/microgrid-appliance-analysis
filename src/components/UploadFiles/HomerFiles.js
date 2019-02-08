import * as React from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'

const HomerFiles = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column width={10}>
        <Segment>
          <h2>HOMER Files</h2>
          <p>
            <big>
              Our mission is to improve lives in the developing world through increased access to
              sustainable energy and related services. We believe that technology can be a profound
              driver of positive impact, and we work closely with early stage entrepreneurs to
              transform their ideas into market-based solutions.
            </big>
          </p>
        </Segment>
      </Grid.Column>
      <Grid.Column width={6}>
        <Segment>
          <Header as="h3">Contact</Header>
        </Segment>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default HomerFiles