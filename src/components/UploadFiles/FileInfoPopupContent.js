import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'

const FilePopupContent = ({ file }) => {
  return (
    <Table basic="very" celled inverted>
      <Table.Body>
        <Table.Row>
          <Table.Cell width={7}>File Size</Table.Cell>
          <Table.Cell width={9}>{file.fileSize}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>File Warnings</Table.Cell>
          <Table.Cell>
            {_.isEmpty(file.fileWarnings) ? 'None' : file.fileWarnings.join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>PV Type</Table.Cell>
          <Table.Cell>{file.pvType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Type</Table.Cell>
          <Table.Cell>{file.batteryType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Generator Type</Table.Cell>
          <Table.Cell>{file.generatorType}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default FilePopupContent
