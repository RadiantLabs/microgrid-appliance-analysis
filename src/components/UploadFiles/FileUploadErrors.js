import * as React from 'react'
import _ from 'lodash'
import { Segment } from 'semantic-ui-react'

export const FileUploadErrors = ({ fileErrors, level }) => {
  if (_.isEmpty(fileErrors)) {
    return 'None Found'
  }
  const levelColor = level === 'error' ? 'red' : 'orange'
  return (
    <Segment color={levelColor} inverted>
      {_.map(fileErrors, error => (
        <p key={error}>{error}</p>
      ))}
    </Segment>
  )
}
