import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'
import InputField from '../../components/Elements/InputField'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import borderlessTableStyles from '../../styles/borderlessTableStyles.module.css'
import { fieldDefinitions } from '../../utils/fieldDefinitions'

const HomerFormFields = ({ store }) => {
  const { viewedGrid } = store
  return (
    <Table basic="very" collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['label'].title}{' '}
            <HelperPopup content={fieldDefinitions['label'].description} position="right center" />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="label" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['description'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['description'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="description" modelInstance={viewedGrid} type="textarea" />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['wholesaleElectricityCost'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['wholesaleElectricityCost'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="wholesaleElectricityCost" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['retailElectricityPrice'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['retailElectricityPrice'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="retailElectricityPrice" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['unmetLoadCostPerKwh'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['unmetLoadCostPerKwh'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="unmetLoadCostPerKwh" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['batteryMinEnergyContent'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['batteryMinEnergyContent'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="batteryMinEnergyContent" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['batteryMaxEnergyContent'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['batteryMaxEnergyContent'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="batteryMaxEnergyContent" modelInstance={viewedGrid} />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} position="right center" />
          </Table.Cell>
          <Table.Cell>{viewedGrid.powerType}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            Battery Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the battery you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{viewedGrid.batteryType}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            PV Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the PV system you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{viewedGrid.pvType}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            Generator Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the generator you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{viewedGrid.generatorType}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(HomerFormFields))
