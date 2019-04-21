import * as React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Route } from 'react-router-dom'
import { Card, Table, Divider, Header, Button, Grid } from 'semantic-ui-react'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
import { HelperPopup } from '../../../components/Elements/HelperPopup'

// -----------------------------------------------------------------------------
// Cards
// -----------------------------------------------------------------------------
const gridFields = [
  'pvType',
  'powerType',
  'batteryType',
  'generatorType',
  'wholesaleElectricityCost',
  'retailElectricityPrice',
  'unmetLoadCostPerKwh',
  'batteryMinEnergyContent',
  'batteryEstimatedMinEnergyContent',
  'batteryMaxEnergyContent',
  'batteryEstimatedMaxEnergyContent',
]

const applianceFields = [
  'capex',
  'capexAssignment',
  'powerType',
  'phase',
  'hasMotor',
  'powerFactor',
  'nominalPower',
  'dutyCycleDerateFactor',
  'productionUnitType',
  'productionUnitsPerKwh',
  'revenuePerProductionUnits',
]

const ancillaryEquipmentFields = [
  'compatibility',
  'compatibilityMessage',
  'capex',
  'capexAssignment',
  'estimatedCapex',
  'efficiencyRating',
  'estimatedEfficiency',
  'equipmentSize',
]

function booleanDisplay(val) {
  return val ? 'Yes' : 'No'
}

function compatibilityDisplay(val) {
  switch (val) {
    case 'required':
      return 'Required Equipment'
    case 'useful':
      return 'Equipment may be useful'
    case 'notuseful':
      return 'Incompatible Equipment'
    default:
      return 'N/A'
  }
}

const PopupContent = ({ field }) => {
  const description = fieldDefinitions[field].description
  return (
    <div>
      {description && <p>{description}</p>}
      <p>
        Internal Field Name:
        <br />
        <code>{field}</code>
      </p>
    </div>
  )
}

export const GridCard = observer(({ grid }) => {
  const { cardIsOpen, toggleCard } = grid
  return (
    <div>
      <Divider horizontal>Active Grid</Divider>
      <Card fluid className="activeCardBorder" onClick={toggleCard}>
        <Card.Content style={{ backgroundColor: '#F9FAFB' }}>
          <Grid>
            <Grid.Row>
              <Grid.Column width={14}>
                <Header>{grid.label}</Header>
              </Grid.Column>
              <Grid.Column width={2}>
                <Route
                  render={({ history }) => (
                    <Button
                      basic
                      circular
                      icon="right arrow"
                      floated="right"
                      size="tiny"
                      style={{ marginTop: '-6px' }}
                      onClick={() => {
                        history.push('/files/homer')
                      }}
                    />
                  )}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
        <Card.Content description={grid.description} />
        {cardIsOpen && (
          <Card.Content>
            <Table basic="very" compact>
              <Table.Body>
                {_.map(gridFields, field => {
                  return (
                    <Table.Row key={field}>
                      <Table.Cell>
                        {fieldDefinitions[field].title}{' '}
                        <HelperPopup
                          content={<PopupContent field={field} />}
                          position="right center"
                        />
                      </Table.Cell>
                      <Table.Cell textAlign="right">{grid[field]}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </Card.Content>
        )}
        {cardIsOpen && (
          <Card.Content extra>
            File Type: {grid.fileInfo.fileType}
            {grid.fileInfo.isSample ? ', Sample File' : ', Imported File'}
          </Card.Content>
        )}
      </Card>
    </div>
  )
})

export const ApplianceCard = observer(({ appliance }) => {
  const { cardIsOpen, toggleCard } = appliance
  return (
    <Card fluid className="activeCardBorder" onClick={toggleCard}>
      <Card.Content style={{ backgroundColor: '#F9FAFB' }}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14}>
              <Header>{appliance.label}</Header>
            </Grid.Column>
            <Grid.Column width={2}>
              <Route
                render={({ history }) => (
                  <Button
                    basic
                    circular
                    icon="right arrow"
                    floated="right"
                    size="tiny"
                    style={{ marginTop: '-6px' }}
                    onClick={() => {
                      history.push('/files/appliance')
                    }}
                  />
                )}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
      <Card.Content description={appliance.description} />
      {cardIsOpen && (
        <Card.Content>
          <Table basic="very" compact>
            <Table.Body>
              {_.map(applianceFields, field => {
                return (
                  <Table.Row key={field}>
                    <Table.Cell>
                      {fieldDefinitions[field].title}{' '}
                      <HelperPopup
                        content={<PopupContent field={field} />}
                        position="right center"
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {_.isBoolean(appliance[field])
                        ? booleanDisplay(appliance[field])
                        : appliance[field]}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </Card.Content>
      )}
      {cardIsOpen && (
        <Card.Content extra>
          File Type: {appliance.fileInfo.applianceType}
          {appliance.fileInfo.isSample ? ', Sample File' : ', Imported File'}
        </Card.Content>
      )}
    </Card>
  )
})

export const AncillaryEquipmentCard = observer(({ equipment }) => {
  const { cardIsOpen, toggleCard } = equipment
  return (
    <Card fluid className="activeCardBorder" onClick={toggleCard}>
      <Card.Content style={{ backgroundColor: '#F9FAFB' }}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14}>
              <Header>{equipment.label}</Header>
            </Grid.Column>
            <Grid.Column width={2}>
              <Route
                render={({ history }) => (
                  <Button
                    basic
                    circular
                    icon="right arrow"
                    floated="right"
                    size="tiny"
                    style={{ marginTop: '-6px' }}
                    onClick={() => {
                      history.push('/tool/ancillary')
                    }}
                  />
                )}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
      <Card.Content description={equipment.description} />
      {cardIsOpen && (
        <Card.Content>
          <Table basic="very" compact>
            <Table.Body>
              {_.map(ancillaryEquipmentFields, field => {
                return (
                  <Table.Row key={field}>
                    <Table.Cell>
                      {fieldDefinitions[field].title}{' '}
                      <HelperPopup
                        content={<PopupContent field={field} />}
                        position="right center"
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {field === 'compatibility'
                        ? compatibilityDisplay(equipment[field])
                        : equipment[field]}{' '}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </Card.Content>
      )}
    </Card>
  )
})
