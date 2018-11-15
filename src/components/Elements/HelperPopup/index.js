import * as React from 'react'
import { Icon, Popup } from 'semantic-ui-react'

export const HelperPopup = content => (
  <Popup
    trigger={<Icon name="question circle outline" size="small" color="grey" />}
    position="bottom left"
    inverted
    content={content}
  />
)
