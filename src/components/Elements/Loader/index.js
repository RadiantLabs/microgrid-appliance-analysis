import * as React from 'react'
import { Dimmer, Loader, Segment } from 'semantic-ui-react'

const LoaderSpinner = () => (
  <Segment>
    <Dimmer active style={{ height: '200px' }}>
      <Loader>Loading</Loader>
    </Dimmer>
  </Segment>
)

export default LoaderSpinner
