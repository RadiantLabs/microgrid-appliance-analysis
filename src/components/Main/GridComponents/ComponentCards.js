import * as React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Card, Icon, Table } from 'semantic-ui-react'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'

// -----------------------------------------------------------------------------
// Cards
// -----------------------------------------------------------------------------
const GridFields = [
  'pvType',
  'powerType',
  'batteryType',
  'generatorType',
  'wholesaleElectricityCost',
  'retailElectricityPrice',
  'unmetLoadCostPerKwh',
  'batteryMinEnergyContent',
  'batteryMaxEnergyContent',
]

export const GridCard = observer(({ grid }) => {
  return (
    <Card fluid href="/files/homer">
      <Card.Content header={grid.label} style={{ backgroundColor: '#F9FAFB' }} />
      <Card.Content description={grid.description} />
      <Card.Content>
        <Table basic="very" celled>
          <Table.Body>
            {_.map(GridFields, field => {
              return (
                <Table.Row key={field}>
                  <Table.Cell>{fieldDefinitions[field].title}</Table.Cell>
                  <Table.Cell>{grid[field]}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </Card.Content>
      <Card.Content extra>File Type: {grid.fileInfo.fileType}</Card.Content>
    </Card>
  )
})

export const ApplianceCard = observer(({ appliance }) => {
  return (
    <Card fluid href="/files/appliance">
      <Card.Content header={appliance.label} style={{ backgroundColor: '#F9FAFB' }} />
      <Card.Content description="description" />
      <Card.Content extra>
        <Icon name="user" />4 Friends
      </Card.Content>
    </Card>
  )
})

export const AncillaryEquipmentCard = observer(({ equipment }) => {
  return (
    <Card fluid href="/tool/ancillary">
      <Card.Content header={equipment.label} style={{ backgroundColor: '#F9FAFB' }} />
      <Card.Content description="description" />
      <Card.Content extra>
        <Icon name="user" />4 Friends
      </Card.Content>
    </Card>
  )
})
