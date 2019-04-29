import * as React from 'react'
import { Table } from 'semantic-ui-react'
import _ from 'lodash'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'

export const CustomToolTip = ({ active, payload, label, columns, timeSegmentsBy }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  const totalColumnName = columns[2]
  const totalVal = payload[0]['payload'][totalColumnName]
  return (
    <div className="custom-tooltip">
      <p className="label">
        {fieldDefinitions[timeSegmentsBy].title}: {label}
      </p>
      <Table basic="very" compact>
        <Table.Body>
          {_.map(payload, element => {
            return (
              <Table.Row style={{ color: element.color }} key={element.dataKey}>
                <Table.Cell>{fieldDefinitions[element.dataKey].title}</Table.Cell>
                <Table.Cell textAlign="right">
                  {_.round(element.value, 2)} {fieldDefinitions[element.dataKey].units}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>{fieldDefinitions[totalColumnName].title}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              {totalVal}
              {fieldDefinitions[totalColumnName].units}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  )
}
