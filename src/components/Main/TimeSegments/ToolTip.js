import * as React from 'react'
import { Table } from 'semantic-ui-react'
import _ from 'lodash'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'

export const CustomToolTip = ({
  active,
  payload,
  label,
  totalsColumnName,
  timeSegmentsBy,
  timeSegmentsAggregation,
}) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  const totalVal = payload[0]['payload'][totalsColumnName]
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
                  {_.round(element.value, 2)}{' '}
                  {timeSegmentsAggregation === 'count'
                    ? 'times/yr'
                    : fieldDefinitions[element.dataKey].units}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>{fieldDefinitions[totalsColumnName].title}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              {totalVal}{' '}
              {timeSegmentsAggregation === 'count'
                ? 'times/yr'
                : fieldDefinitions[totalsColumnName].units}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  )
}
