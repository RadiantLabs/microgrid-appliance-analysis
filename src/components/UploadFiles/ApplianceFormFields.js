import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Dropdown } from 'semantic-ui-react'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import borderlessTableStyles from 'src/styles/borderlessTableStyles.module.css'
import InputField from 'src/components/Elements/InputField'
import { fieldDefinitions } from 'src/utils/fieldDefinitions'

const ApplianceFormFields = ({ store }) => {
  const { viewedAppliance } = store
  const {
    powerType,
    handlePowerTypeChange,
    powerFactor,
    phase,
    handlePhaseChange,
    hasMotor,
  } = viewedAppliance
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['label'].title}{' '}
            <HelperPopup position="right center" content={fieldDefinitions['label'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="label" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['description'].title}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['description'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="description" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} position="right center" />
          </Table.Cell>
          <Table.Cell>
            <Dropdown text={powerType}>
              <Dropdown.Menu>
                <Dropdown.Item text="AC" value="AC" onClick={handlePowerTypeChange} />
                <Dropdown.Item text="DC" value="DC" onClick={handlePowerTypeChange} />
              </Dropdown.Menu>
            </Dropdown>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Phase <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>
            <Dropdown text={String(phase)}>
              <Dropdown.Menu>
                <Dropdown.Item text="1" value={1} onClick={handlePhaseChange} />
                <Dropdown.Item text="2" value={2} onClick={handlePhaseChange} />
                <Dropdown.Item text="3" value={3} onClick={handlePhaseChange} />
              </Dropdown.Menu>
            </Dropdown>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Factor <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>{powerFactor}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Has Motor? <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>{hasMotor ? 'Yes' : 'No'}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['nominalPower'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['nominalPower'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="nominalPower" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['dutyCycleDerateFactor'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['dutyCycleDerateFactor'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="dutyCycleDerateFactor" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['productionUnitType'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['productionUnitType'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="productionUnitType" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['productionUnitsPerKwh'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['productionUnitsPerKwh'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="productionUnitsPerKwh" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['revenuePerProductionUnits'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['revenuePerProductionUnits'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="revenuePerProductionUnits" modelInstance={viewedAppliance} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ApplianceFormFields))
