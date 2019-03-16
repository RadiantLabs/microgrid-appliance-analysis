import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Dropdown } from 'semantic-ui-react'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import { ApplianceSummaryStats } from './ApplianceSummaryStats'
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
    fileErrors,
    fileWarnings,
  } = viewedAppliance

  // TODO: At some point we may want to disable these fields for sample files.
  // Leave it open for at least testing
  // const { isSample } = fileInfo
  const fieldDisabled = false
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['label'].title}{' '}
          <HelperPopup position="right center" content={fieldDefinitions['label'].description} />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField fieldKey="label" modelInstance={viewedAppliance} />
        </Grid.Column>
        <Grid.Column width={4}>
          {fieldDefinitions['powerType'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['powerType'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
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
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['description'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['description'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField fieldKey="description" modelInstance={viewedAppliance} />
        </Grid.Column>

        <Grid.Column width={4}>
          {fieldDefinitions['phase'].title}{' '}
          <HelperPopup position="right center" content={fieldDefinitions['phase'].description} />
        </Grid.Column>
        <Grid.Column width={4}>
          <Dropdown text={String(phase)} disabled={fieldDisabled}>
            <Dropdown.Menu>
              {_.map(fieldDefinitions['phase'].enumerations, item => (
                <Dropdown.Item text={item} value={item} key={item} onClick={handlePhaseChange} />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['nominalPower'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['nominalPower'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="nominalPower"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>

        <Grid.Column width={4}>
          {fieldDefinitions['hasMotor'].title}{' '}
          <HelperPopup position="right center" content={fieldDefinitions['hasMotor'].description} />{' '}
        </Grid.Column>
        <Grid.Column width={4}>
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
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['productionUnitType'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['productionUnitType'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="productionUnitType"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>

        <Grid.Column width={4}>
          {fieldDefinitions['powerFactor'].title}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['powerFactor'].description}
          />{' '}
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="powerFactor"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['productionUnitsPerKwh'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['productionUnitsPerKwh'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="productionUnitsPerKwh"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>

        <Grid.Column width={4}>
          {fieldDefinitions['dutyCycleDerateFactor'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['dutyCycleDerateFactor'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="dutyCycleDerateFactor"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4}>
          {fieldDefinitions['revenuePerProductionUnits'].title}{' '}
          <HelperPopup
            position="right center"
            content={fieldDefinitions['revenuePerProductionUnits'].description}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <InputField
            fieldKey="revenuePerProductionUnits"
            modelInstance={viewedAppliance}
            disabled={fieldDisabled}
          />
        </Grid.Column>

        <Grid.Column width={4} />
        <Grid.Column width={4} />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={4}>File Upload Warnings</Grid.Column>
        <Grid.Column width={12}>
          <FileUploadErrors fileErrors={fileWarnings} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={4}>File Upload Errors</Grid.Column>
        <Grid.Column width={12}>
          <FileUploadErrors fileErrors={fileErrors} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={16}>
          <ApplianceSummaryStats />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default inject('store')(observer(ApplianceFormFields))

const FileUploadErrors = ({ fileErrors }) => {
  if (_.isEmpty(fileErrors)) {
    return 'None Found'
  }
  return (
    <div>
      {_.map(fileErrors, error => (
        <div key={error}>{error}</div>
      ))}
    </div>
  )
}
