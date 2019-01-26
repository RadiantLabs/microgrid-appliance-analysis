import * as React from 'react'
import { Icon, Popup } from 'semantic-ui-react'

export const HelperPopup = ({ content, position = 'bottom left' }) => {
  return (
    <Popup
      trigger={<Icon name="question circle outline" size="small" color="grey" />}
      position={position}
      inverted
      content={content}
    />
  )
}
