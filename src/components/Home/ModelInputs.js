import * as React from 'react'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from '../InputField'

const ModelInputs = ({ store }) => {
  return (
    <Table basic="very" celled collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Usage Factor to kW</Table.Cell>
          <Table.Cell>
            <InputField fieldKey="kwFactorToKw" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Duty Cycle Derate Factor</Table.Cell>
          <Table.Cell>
            <InputField fieldKey="dutyCycleDerateFactor" />
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Usage Factor Seasonal Derate</Table.Cell>
          <Table.Cell>TBD</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>HOMER Minimum State of Charge</Table.Cell>
          <Table.Cell>TBD</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ModelInputs))
