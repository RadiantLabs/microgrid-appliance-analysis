import * as React from 'react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const LoaderSpinner = () => (
  <Segment>
    <Dimmer active style={{ height: '200px' }}>
      <Loader>Loading</Loader>
    </Dimmer>
    <Image src="https://react.semantic-ui.com/src/images/wireframe/short-paragraph.png" />
  </Segment>
)

export default LoaderSpinner
