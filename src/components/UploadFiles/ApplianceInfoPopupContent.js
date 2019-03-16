import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'

const ApplianceInfoPopupContent = ({ file }) => {
  const { prettyFileSize, powerType, fileWarnings, phase, hasMotor } = file
  console.log('file: ', file)
  return (
    <Table basic="very" celled inverted>
      <Table.Body>
        <Table.Row>
          <Table.Cell width={7}>File Warnings</Table.Cell>
          <Table.Cell width={9}>
            {_.isEmpty(file.fileWarnings) ? 'None' : fileWarnings.join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Power Type</Table.Cell>
          <Table.Cell>{powerType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Phase</Table.Cell>
          <Table.Cell>{phase}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Has Motor</Table.Cell>
          <Table.Cell>{hasMotor ? 'Yes' : 'No'}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>File Size</Table.Cell>
          <Table.Cell>{prettyFileSize}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default ApplianceInfoPopupContent
