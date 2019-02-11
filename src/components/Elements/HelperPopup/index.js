import * as React from 'react'
import { Icon, Popup } from 'semantic-ui-react'

const iconStyle = {
  position: 'relative',
  zIndex: '1000',
}

export const HelperPopup = props => {
  const { content, wide, inverted = true, position = 'bottom left' } = props
  return (
    <Popup
      trigger={<Icon name="question circle outline" size="small" color="grey" style={iconStyle} />}
      position={position}
      inverted={inverted}
      wide={wide}>
      <Popup.Content>{content}</Popup.Content>
    </Popup>
  )
}
