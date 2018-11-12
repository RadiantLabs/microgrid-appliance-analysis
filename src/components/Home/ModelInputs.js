import * as React from 'react'
import { Table } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'

const ModelInputs = ({ store }) => {
  // const {
  //   modelInputs: { homerMinStateOfCharge },
  // } = store

  return (
    <Table basic="very" celled collapsing>
      <Table.Body>
        {/* <Table.Row>
          <Table.Cell>HOMER File</Table.Cell>
          <Table.Cell>-</Table.Cell>
        </Table.Row> */}

        {/* <Table.Row>
          <Table.Cell>Appliance Usage Profile</Table.Cell>
          <Table.Cell>-</Table.Cell>
        </Table.Row> */}

        <Table.Row>
          <Table.Cell>Usage Factor to kW</Table.Cell>
          <Table.Cell>-</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>Usage Factor Seasonal Derate</Table.Cell>
          <Table.Cell>-</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>HOMER Minimum State of Charge</Table.Cell>
          <Table.Cell>homerMinStateOfCharge %</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(ModelInputs))
