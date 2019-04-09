import * as React from 'react'
import { Table, Input } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from '../../../components/Elements/InputField'
import { HelperPopup } from '../../../components/Elements/HelperPopup'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
import borderlessTableStyles from '../../../styles/borderlessTableStyles.module.css'

export const EconomicInputs = inject('store')(
  observer(({ store }) => {
    const { activeGrid, enabledAppliances, multipleAppliancesEnabled } = store
    return (
      <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['wholesaleElectricityCost'].title}{' '}
              <HelperPopup content={fieldDefinitions['wholesaleElectricityCost'].description} />
            </Table.Cell>
            <Table.Cell>
              <InputField fieldKey="wholesaleElectricityCost" modelInstance={activeGrid} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['retailElectricityPrice'].title}{' '}
              <HelperPopup content={fieldDefinitions['retailElectricityPrice'].description} />
            </Table.Cell>
            <Table.Cell>
              <InputField fieldKey="retailElectricityPrice" modelInstance={activeGrid} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['unmetLoadCostPerKwh'].title}{' '}
              <HelperPopup content={fieldDefinitions['unmetLoadCostPerKwh'].description} />
            </Table.Cell>
            <Table.Cell>
              <InputField fieldKey="unmetLoadCostPerKwh" modelInstance={activeGrid} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['revenuePerProductionUnits'].title}{' '}
              <HelperPopup content={fieldDefinitions['revenuePerProductionUnits'].description} />
            </Table.Cell>
            <Table.Cell>
              {multipleAppliancesEnabled ? (
                'Multiple Appliance Enabled'
              ) : (
                <InputField
                  fieldKey="revenuePerProductionUnits"
                  modelInstance={enabledAppliances[0]}
                />
              )}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)

export const TechnicalInputs = inject('store')(
  observer(({ store }) => {
    const { enabledAppliances, multipleAppliancesEnabled } = store
    return (
      <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['nominalPower'].title}{' '}
              <HelperPopup content={fieldDefinitions['nominalPower'].description} />
            </Table.Cell>
            <Table.Cell>
              {multipleAppliancesEnabled ? (
                'Multiple Appliance Enabled'
              ) : (
                <InputField fieldKey="nominalPower" modelInstance={enabledAppliances[0]} />
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['dutyCycleDerateFactor'].title}{' '}
              <HelperPopup content={fieldDefinitions['dutyCycleDerateFactor'].description} />
            </Table.Cell>
            <Table.Cell>
              {multipleAppliancesEnabled ? (
                'Multiple Appliance Enabled'
              ) : (
                <InputField fieldKey="dutyCycleDerateFactor" modelInstance={enabledAppliances[0]} />
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {fieldDefinitions['productionUnitsPerKwh'].title}{' '}
              <HelperPopup content={fieldDefinitions['productionUnitsPerKwh'].description} />
            </Table.Cell>
            <Table.Cell>
              {multipleAppliancesEnabled ? (
                'Multiple Appliance Enabled'
              ) : (
                <InputField fieldKey="productionUnitsPerKwh" modelInstance={enabledAppliances[0]} />
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Usage Factor Seasonal Derate Curve</Table.Cell>
            <Table.Cell>
              <Input value="TBD" disabled />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)
