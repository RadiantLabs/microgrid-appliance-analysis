import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Card, Form, Input, Checkbox } from 'semantic-ui-react'
import { HelperPopup } from '../Elements/HelperPopup'
import { getEquipmentDiagram } from '../../utils/ancillaryEquipmentRules'

// TODO: Make all data camelCase
const acillaryEquipmentUnits = {
  powerConverter: { units: 'kW' },
  inverter: { units: 'kW' },
}

const cardBorderStyles = {
  border: '1px solid #2185d0',
}

class EquipmentCard extends Component {
  render() {
    if (_.isEmpty(this.props.equipmentInfo)) {
      return null
    }
    const { equipmentType, label, description, message, status } = this.props.equipmentInfo
    const isRequired = status === 'required'
    const isEnabled = _.sample([true, false])
    const toggleLabel = isRequired ? 'Required' : isEnabled ? 'Enabled' : 'Enable'
    return (
      <Card fluid style={isEnabled ? cardBorderStyles : {}}>
        <div style={{ float: 'left', marginLeft: 10, marginTop: 10, width: 250 }}>
          <Checkbox
            toggle
            label={toggleLabel}
            // checked={isEnabled}
            // disabled={isRequired ? true : null}
          />
        </div>
        {getEquipmentDiagram(equipmentType)}
        <Card.Content style={{ borderTop: 'none' }}>
          <Card.Header>
            {label} <HelperPopup content={description} position="right center" />
          </Card.Header>
          <Card.Description>{message}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Form>
            <Form.Field>
              <label>Cost</label>
              <Input label={{ basic: true, content: '$' }} labelPosition="right" value={10} />
            </Form.Field>
            <Form.Field>
              <label>Size</label>
              <Input label={{ basic: true, content: 'kW' }} labelPosition="right" value={10} />
            </Form.Field>
          </Form>
        </Card.Content>
      </Card>
    )
  }
}

export default inject('store')(observer(EquipmentCard))
