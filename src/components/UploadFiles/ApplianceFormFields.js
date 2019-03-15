import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Table, Dropdown } from 'semantic-ui-react'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import borderlessTableStyles from '../../styles/borderlessTableStyles.module.css'
import InputField from '../../components/Elements/InputField'
import { fieldDefinitions } from '../../utils/fieldDefinitions'

const ApplianceFormFields = ({ store }) => {
  const { viewedAppliance } = store
  const {
    powerType,
    handlePowerTypeChange,
    phase,
    handlePhaseChange,
    hasMotor,
    handleHasMotorChange,
    // fileInfo,
  } = viewedAppliance

  // TODO: At some point we may want to disable these fields for sample files.
  // Leave it open for at least testing
  // const { isSample } = fileInfo
  const fieldDisabled = false
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
            {fieldDefinitions['powerType'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['powerType'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <Dropdown text={powerType} disabled={fieldDisabled}>
              <Dropdown.Menu>
                {_.map(fieldDefinitions['powerType'].enumerations, item => (
                  <Dropdown.Item
                    text={item}
                    value={item}
                    key={item}
                    onClick={handlePowerTypeChange}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['phase'].title}{' '}
            <HelperPopup position="right center" content={fieldDefinitions['phase'].description} />
          </Table.Cell>
          <Table.Cell>
            <Dropdown text={String(phase)} disabled={fieldDisabled}>
              <Dropdown.Menu>
                {_.map(fieldDefinitions['phase'].enumerations, item => (
                  <Dropdown.Item text={item} value={item} key={item} onClick={handlePhaseChange} />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['powerFactor'].title}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['powerFactor'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <InputField
              fieldKey="powerFactor"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['hasMotor'].title}{' '}
            <HelperPopup
              position="right center"
              content={fieldDefinitions['hasMotor'].description}
            />
          </Table.Cell>
          <Table.Cell>
            <Dropdown text={hasMotor ? 'Yes' : 'No'} disabled={fieldDisabled}>
              <Dropdown.Menu>
                {_.map(fieldDefinitions['hasMotor'].enumerations, item => (
                  <Dropdown.Item
                    text={item ? 'Yes' : 'No'}
                    value={item}
                    key={item}
                    onClick={handleHasMotorChange}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Table.Cell>
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
            <InputField
              fieldKey="nominalPower"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
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
            <InputField
              fieldKey="dutyCycleDerateFactor"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
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
            <InputField
              fieldKey="productionUnitType"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
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
            <InputField
              fieldKey="productionUnitsPerKwh"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
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
            <InputField
              fieldKey="revenuePerProductionUnits"
              modelInstance={viewedAppliance}
              disabled={fieldDisabled}
            />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ApplianceFormFields))
