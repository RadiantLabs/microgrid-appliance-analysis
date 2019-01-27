import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Card, Image, Button, Form, Input } from 'semantic-ui-react'
import { HelperPopup } from '../Elements/HelperPopup'
import acToDcPowerConverter from '../../images/ac_to_dc_power_converter.png'

// TODO: Make all data camelCase
const acillaryEquipmentUnits = {
  powerConverter: { units: 'kW' },
  inverter: { units: 'kW' },
}

class EquipmentCard extends Component {
  render() {
    if (_.isEmpty(this.props.equipmentInfo)) {
      return null
    }
    const { equipmentType, label, description, message, status } = this.props.equipmentInfo
    return (
      <Card fluid>
        <Image src={acToDcPowerConverter} />
        <Card.Content>
          <Card.Header>
            {label} <HelperPopup content={description} position="right center" />
          </Card.Header>
          <Card.Description>{message}</Card.Description>
          <Card.Description>
            <Form>
              <Form.Field inline>
                <label>Cost</label>
                <Input label={{ basic: true, content: '$' }} labelPosition="right" value={10} />
              </Form.Field>
              <Form.Field inline>
                <label>Size</label>
                <Input label={{ basic: true, content: 'kW' }} labelPosition="right" value={10} />
              </Form.Field>
            </Form>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <div className="ui two buttons">
            <Button basic color="green">
              Approve
            </Button>
            <Button basic color="red">
              Decline
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }
}

export default inject('store')(observer(EquipmentCard))
