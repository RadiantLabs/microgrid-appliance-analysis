import * as React from 'react'
import { Table, Icon, Popup } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from '../Elements/InputField'
import { fieldDefinitions } from '../../utils/fieldDefinitions'

const HelperPopup = content => (
  <Popup
    trigger={<Icon name="question circle outline" size="small" color="grey" />}
    position="bottom left"
    content={content}
  />
)

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
            {fieldDefinitions['productionToThroughput'].title}{' '}
            <HelperPopup content={fieldDefinitions['productionToThroughput'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="productionToThroughput" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['throughputToRevenue'].title}{' '}
            <HelperPopup content={fieldDefinitions['throughputToRevenue'].description} />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="throughputToRevenue" />
            {/* TODO: units */}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ModelInputs))
