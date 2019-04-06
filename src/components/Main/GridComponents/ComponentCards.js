import * as React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Card, Table, Divider } from 'semantic-ui-react'
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
  'batteryMaxEnergyContent',
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

export const GridCard = observer(({ grid, expanded }) => {
  return (
    <div>
      <Divider horizontal>Active Grid</Divider>
      <Card fluid href="/files/homer">
        <Card.Content header={grid.label} style={{ backgroundColor: '#F9FAFB' }} />
        <Card.Content description={grid.description} />
        {expanded && (
          <Card.Content>
            <Table basic="very" celled>
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
                      <Table.Cell>{grid[field]}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </Card.Content>
        )}
        {expanded && (
          <Card.Content extra>
            File Type: {grid.fileInfo.fileType}
            {grid.fileInfo.isSample ? ', Sample File' : ', Imported File'}
          </Card.Content>
        )}
      </Card>
    </div>
  )
})

export const ApplianceCard = observer(({ appliance, expanded }) => {
  return (
    <Card fluid href="/files/appliance">
      <Card.Content header={appliance.label} style={{ backgroundColor: '#F9FAFB' }} />
      <Card.Content description={appliance.description} />
      {expanded && (
        <Card.Content>
          <Table basic="very" celled>
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
                    <Table.Cell>
                      {fieldDefinitions[field].type === 'boolean'
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
      {expanded && (
        <Card.Content extra>
          File Type: {appliance.fileInfo.applianceType}
          {appliance.fileInfo.isSample ? ', Sample File' : ', Imported File'}
        </Card.Content>
      )}
    </Card>
  )
})

export const AncillaryEquipmentCard = observer(({ equipment, expanded }) => {
  return (
    <Card fluid href="/tool/ancillary">
      <Card.Content header={equipment.label} style={{ backgroundColor: '#F9FAFB' }} />
      <Card.Content description={equipment.description} />
      {expanded && (
        <Card.Content>
          <Table basic="very" celled>
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
                    <Table.Cell>
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
