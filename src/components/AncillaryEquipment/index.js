import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Label, Checkbox, Table } from 'semantic-ui-react'
import { HelperPopup } from '../Elements/HelperPopup'

class AncillaryEquipment extends Component {
  render() {
    const { ancillaryEquipmentOptions } = this.props.store
    console.log('ancillaryEquipmentOptions: ', ancillaryEquipmentOptions)
    return (
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Label color="black">Is Required</Label>
            </Table.Cell>
            <Table.Cell>
              Power Converter{' '}
              <HelperPopup
                content="A power converter converts AC power to DC power. An example may be converting AC grid electricity to power a fan driven by a DC motor"
                position="top right"
              />
            </Table.Cell>
            <Table.Cell>
              A power converter is required hardware for successful appliance operation
            </Table.Cell>
            <Table.Cell>Input controls</Table.Cell>
            <Table.Cell textAlign="right">
              <Checkbox label="Enable" style={{ marginRight: 18 }} />
              <a href="#">Dismiss</a>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <Label color="grey" basic>
                May Be Useful
              </Label>
            </Table.Cell>
            <Table.Cell>
              Soft Starter{' '}
              <HelperPopup
                content="A softstarter slowly ramps up AC voltage when starting a motor to reduce starting torque and provide inrush current relief. An example may be a softstarter upstream of a pump to limit inrush current and water hammer throughout a system."
                position="top right"
              />
            </Table.Cell>
            <Table.Cell>
              A soft starter may be useful to reduce in-rush current and starting torque and to
              provide motor protection
            </Table.Cell>
            <Table.Cell>Input controls</Table.Cell>
            <Table.Cell textAlign="right">
              <Checkbox label="Enable" style={{ marginRight: 18 }} />
              <a href="#">Dismiss</a>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default inject('store')(observer(AncillaryEquipment))
