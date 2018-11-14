import * as React from 'react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const LoaderSpinner = () => (
  <Segment>
    <Dimmer active>
      <Loader>Loading</Loader>
    </Dimmer>
    <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
  </Segment>
)

export default LoaderSpinner
