import * as React from 'react'
import { Segment } from 'semantic-ui-react'

const FourOhFour = ({ match }) => {
  console.log('match: ', match)
  return (
    <Segment>
      <h2>Page Not Found</h2>
    </Segment>
  )
}

export default FourOhFour
