import * as React from 'react'
// import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Segment } from 'semantic-ui-react'

export const ApplianceFileInstructions = inject('store')(
  observer(({ store }) => {
    return (
      <Segment>
        <h3>Appliance File Instructions</h3>
        <p>What does an uploaded appliance usage file look like?</p>
        {/*TODO: add table with appliance example */}
        {/*TODO: add download link with appliance example */}
        {/*TODO: add kw_factor explanation (look up from Amanda's email) */}
      </Segment>
    )
  })
)
