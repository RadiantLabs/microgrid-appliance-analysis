import * as React from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import FileButton from 'components/Elements/FileButton'

const HomerFiles = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column width={10}>
        <Segment>
          <h2>HOMER Files</h2>
          <FileButton content="Upload HOMER File" icon="upload" basic color="blue" />
        </Segment>
      </Grid.Column>
      <Grid.Column width={6}>
        <Header as="h3">Contact</Header>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default HomerFiles
