import * as React from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import HomerFileForm from './HomerFileForm'

const HomerFiles = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column>
        <HomerFileForm />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default HomerFiles
