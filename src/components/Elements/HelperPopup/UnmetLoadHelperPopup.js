import * as React from 'react'
import { Icon, Popup, Table } from 'semantic-ui-react'

export const UnmetLoadHelperPopup = content => (
  <Popup
    trigger={<Icon name="question circle outline" size="small" color="grey" />}
    position="bottom left"
    wide="very"
    inverted>
    <div>
      <h4>Number of unmet load hours in a year</h4>
      <p>The counts are the number of hours in a year where there is an unmet load.</p>
      <p>TODO: What is the threshold of unmet vs met? It depends on how we round it.</p>
      <p>TODO: Why don't original and additional counts add up to total? Add a table below</p>
      {/* <Table definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Arguments</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>reset rating</Table.Cell>
            <Table.Cell>None</Table.Cell>
            <Table.Cell>Resets rating to default value</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>set rating</Table.Cell>
            <Table.Cell>rating (integer)</Table.Cell>
            <Table.Cell>Sets the current star rating to specified value</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table> */}
    </div>
  </Popup>
)

// <Table.HeaderCell>Original Unmet Load Count</Table.HeaderCell>
// <Table.HeaderCell>Additional Unmet Load Count</Table.HeaderCell>
// <Table.HeaderCell>Total Unmet Load Count</Table.HeaderCell>
