import * as React from 'react'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from '../Elements/InputField'
import { HelperPopup } from '../Elements/HelperPopup'
import { fieldDefinitions } from '../../utils/fieldDefinitions'

// TODO: Generate these in a loop
const ModelInputs = ({ store }) => {
  return (
    <Table basic="very" celled collapsing compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['kwFactorToKw'].title}{' '}
            <HelperPopup content={fieldDefinitions['kwFactorToKw'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="kwFactorToKw" />
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
          <Table.Cell>TBD</Table.Cell>
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
