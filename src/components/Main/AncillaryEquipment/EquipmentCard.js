import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Label, Card, Form, Input, Checkbox } from 'semantic-ui-react'
import { HelperPopup } from '../../../components/Elements/HelperPopup'
import { getEquipmentDiagram } from '../../../utils/ancillaryEquipmentRules'

const cardBorderStyles = {
  border: '1px solid #2185d0',
}

class EquipmentCard extends Component {
  handleToggleChange = (equipmentType, event, data) => {
    event.preventDefault()
    this.props.store.ancillaryEquipment.setEnabledFromCheckbox(equipmentType, data.checked)
    return null
  }

  render() {
    if (_.isEmpty(this.props.equipmentInfo)) {
      return null
    }
    const { equipmentType, label, description, message, status } = this.props.equipmentInfo
    const { enabledStates } = this.props.store.ancillaryEquipment
    const enabled = enabledStates[equipmentType]
    const isRequired = status === 'required'
    const toggleLabel = isRequired ? 'Required' : enabled ? 'Enabled' : 'Enable'
    return (
      <Card fluid style={enabled ? cardBorderStyles : {}}>
        <div style={{ float: 'left', marginLeft: 10, marginTop: 10, width: 250 }}>
          <Checkbox
            toggle
            label={toggleLabel}
            checked={enabled}
            disabled={isRequired ? true : null}
            onChange={this.handleToggleChange.bind(null, equipmentType)}
          />
        </div>
        {getEquipmentDiagram(equipmentType)}
        <Card.Content style={{ borderTop: 'none' }}>
          <Card.Header>
            {label} <HelperPopup content={description} position="right center" />
          </Card.Header>
          <Card.Description>{message}</Card.Description>
        </Card.Content>
        {enabled && (
          <Card.Content extra>
            <Form>
              <Form.Field>
                <Input labelPosition="right" type="text" size="mini" fluid>
                  <Label basic>Cost</Label>
                  <input />
                  <Label>USD</Label>
                </Input>
              </Form.Field>
              <Form.Field>
                <Input labelPosition="right" type="text" size="mini" fluid>
                  <Label basic>Size</Label>
                  <input />
                  <Label>kW</Label>
                </Input>
              </Form.Field>
            </Form>
          </Card.Content>
        )}
      </Card>
    )
  }
}

export default inject('store')(observer(EquipmentCard))
