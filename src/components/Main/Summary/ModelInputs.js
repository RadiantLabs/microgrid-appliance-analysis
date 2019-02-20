import * as React from 'react'
import { Table, Input } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from 'src/components/Elements/InputField'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import { fieldDefinitions } from 'src/utils/fieldDefinitions'
import borderlessTableStyles from 'src/styles/borderlessTableStyles.module.css'

// TODO: Generate these in a loop
const ModelInputs = ({ store }) => {
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['applianceNominalPower'].title}{' '}
            <HelperPopup content={fieldDefinitions['applianceNominalPower'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="applianceNominalPower" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['dutyCycleDerateFactor'].title}{' '}
            <HelperPopup content={fieldDefinitions['dutyCycleDerateFactor'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="dutyCycleDerateFactor" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Usage Factor Seasonal Derate Curve</Table.Cell>
          <Table.Cell>
            <Input value="TBD" disabled />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['wholesaleElectricityCost'].title}{' '}
            <HelperPopup content={fieldDefinitions['wholesaleElectricityCost'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="wholesaleElectricityCost" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['unmetLoadCostPerKwh'].title}{' '}
            <HelperPopup content={fieldDefinitions['unmetLoadCostPerKwh'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="unmetLoadCostPerKwh" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['retailElectricityPrice'].title}{' '}
            <HelperPopup content={fieldDefinitions['retailElectricityPrice'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="retailElectricityPrice" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['productionUnitsPerKwh'].title}{' '}
            <HelperPopup content={fieldDefinitions['productionUnitsPerKwh'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="productionUnitsPerKwh" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['revenuePerProductionUnits'].title}{' '}
            <HelperPopup content={fieldDefinitions['revenuePerProductionUnits'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="revenuePerProductionUnits" />
            {/* TODO: units */}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ModelInputs))
