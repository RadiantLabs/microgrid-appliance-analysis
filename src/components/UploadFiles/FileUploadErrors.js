import * as React from 'react'
import _ from 'lodash'
import { Segment } from 'semantic-ui-react'

export const FileUploadErrors = ({ fileImportErrors, level }) => {
  if (_.isEmpty(fileImportErrors)) {
    return 'None Found'
  }
  const levelColor = level === 'error' ? 'red' : 'orange'
  return (
    <Segment color={levelColor} inverted>
      {_.map(fileImportErrors, error => (
        <p key={error}>{error}</p>
      ))}
    </Segment>
  )
}
