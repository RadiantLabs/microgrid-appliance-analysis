import * as React from 'react'
import { Table, Icon, Popup } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import InputField from '../Elements/InputField'

const HelperPopup = content => (
  <Popup
    trigger={<Icon name="question circle outline" size="small" color="grey" />}
    position="bottom left"
    content={content}
  />
)

const ModelInputs = ({ store }) => {
  return (
    <Table basic="very" celled collapsing compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            Usage Factor to kW{' '}
            <HelperPopup content="Apply the appliance nominal power (in kW) to determine the load profile for this appliance" />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="kwFactorToKw" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Duty Cycle Derate Factor{' '}
            <HelperPopup content="A welder, for exaple, may only run 20% within a 2 minute measured interval. In that case, enter 0.2. If an appliance is running for it's full 2 minute interval, enter 1" />
          </Table.Cell>
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
