import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Dropdown } from 'semantic-ui-react'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import { ApplianceSummaryStats } from './ApplianceSummaryStats'
import InputField from '../../components/Elements/InputField'
import { fieldDefinitions } from '../../utils/fieldDefinitions'
import { booleanDisplay } from '../../utils/helpers'

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

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={8}>
          <FieldLabelInput fieldKey="label" modelInstance={viewedAppliance} />
          <FieldLabelInput fieldKey="description" modelInstance={viewedAppliance} type="textarea" />
          <FieldLabelInput fieldKey="nominalPower" modelInstance={viewedAppliance} />
          <FieldLabelInput fieldKey="productionUnitType" modelInstance={viewedAppliance} />
          <FieldLabelInput fieldKey="productionUnitsPerKwh" modelInstance={viewedAppliance} />
          <FieldLabelInput fieldKey="revenuePerProductionUnits" modelInstance={viewedAppliance} />
        </Grid.Column>

        <Grid.Column width={8}>
          <FieldLabelDropdown
            fieldKey="powerType"
            currentValue={powerType}
            items={fieldDefinitions['powerType'].enumerations}
            clickHandler={handlePowerTypeChange}
          />
          <FieldLabelDropdown
            fieldKey="phase"
            currentValue={phase}
            items={fieldDefinitions['phase'].enumerations}
            clickHandler={handlePhaseChange}
          />
          <FieldLabelDropdown
            fieldKey="hasMotor"
            currentValue={hasMotor}
            items={fieldDefinitions['hasMotor'].enumerations}
            itemDisplayFn={booleanDisplay}
            clickHandler={handleHasMotorChange}
          />
          <FieldLabelInput fieldKey="powerFactor" modelInstance={viewedAppliance} />
          <FieldLabelInput fieldKey="dutyCycleDerateFactor" modelInstance={viewedAppliance} />
        </Grid.Column>
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

const FieldLabelInput = ({ fieldKey, modelInstance, type }) => {
  return (
    <Grid>
      <Grid.Column width={8}>
        {fieldDefinitions[fieldKey].title}{' '}
        <HelperPopup position="right center" content={fieldDefinitions[fieldKey].description} />
      </Grid.Column>
      <Grid.Column width={8}>
        <InputField fieldKey={fieldKey} modelInstance={modelInstance} type={type} />
      </Grid.Column>
    </Grid>
  )
}

const FieldLabelDropdown = ({ fieldKey, currentValue, itemDisplayFn, items, clickHandler }) => {
  return (
    <Grid>
      <Grid.Column width={8}>
        {fieldDefinitions[fieldKey].title}{' '}
        <HelperPopup position="right center" content={fieldDefinitions[fieldKey].description} />
      </Grid.Column>
      <Grid.Column width={8}>
        <Dropdown
          text={itemDisplayFn ? String(itemDisplayFn(currentValue)) : String(currentValue || '')}>
          <Dropdown.Menu>
            {_.map(items, item => (
              <Dropdown.Item
                text={itemDisplayFn ? itemDisplayFn(item) : item}
                value={item}
                key={item}
                onClick={clickHandler}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Grid.Column>
    </Grid>
  )
}

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
