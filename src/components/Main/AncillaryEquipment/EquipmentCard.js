import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Label, Card, Form, Input, Checkbox, Grid, Header } from 'semantic-ui-react'
import { HelperPopup } from '../../../components/Elements/HelperPopup'
import { AncillaryEquipmentDiagram } from './EquipmentDiagram'

const cardBorderStyles = {
  border: '1px solid #2185d0',
}
const estimatedValueStyles = {
  marginTop: '4px',
  fontStyle: 'italic',
}

class EquipmentCard extends Component {
  handleToggleChange = (equipmentType, event, data) => {
    event.preventDefault()
    this.props.store.ancillaryEquipment.setEnabledFromCheckbox(equipmentType, data.checked)
  }

  render() {
    if (_.isEmpty(this.props.equipment)) {
      return null
    }
    const {
      equipmentType,
      label,
      description,
      enabled,
      compatibilityMessage,
      compatibility,
      // capex,
    } = this.props.equipment
    const isRequired = compatibility === 'required'
    const toggleLabel = isRequired ? 'Required' : enabled ? 'Enabled' : 'Enable'
    return (
      <Card fluid style={enabled ? cardBorderStyles : {}}>
        <Card.Content>
          <Grid>
            <Grid.Row>
              <div style={{ marginLeft: 10 }}>
                <Checkbox
                  toggle
                  label={toggleLabel}
                  checked={enabled}
                  disabled={isRequired ? true : null}
                  onChange={this.handleToggleChange.bind(null, equipmentType)}
                />
              </div>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={6}>
                <AncillaryEquipmentDiagram equipmentType={equipmentType} />
                <Header has="h3" style={{ marginTop: '4px', marginBottom: '4px' }}>
                  {label}{' '}
                  <small>
                    <HelperPopup content={description} position="right center" />
                  </small>
                </Header>
                <Card.Description>{compatibilityMessage}</Card.Description>
              </Grid.Column>

              <Grid.Column width={10}>
                <Form>
                  <Form.Group>
                    <Form.Field width={8}>
                      <Input labelPosition="right" type="text" size="mini" fluid>
                        <Label basic>Size</Label>
                        <input />
                        <Label>kW</Label>
                      </Input>
                    </Form.Field>
                    <Form.Field style={estimatedValueStyles}>Appliance Size: 2 kW</Form.Field>
                  </Form.Group>
                  <Form.Group>
                    <Form.Field width={8}>
                      <Input labelPosition="right" type="text" size="mini" fluid>
                        <Label basic>Cost</Label>
                        <input />
                        <Label>USD</Label>
                      </Input>
                    </Form.Field>
                    <Form.Field style={estimatedValueStyles}>Estimated Cost: $1000</Form.Field>
                  </Form.Group>
                  <Form.Group>
                    <Form.Field width={8}>
                      <Input labelPosition="right" type="text" size="mini" fluid>
                        <Label basic>Efficiency</Label>
                        <input />
                        <Label>-</Label>
                      </Input>
                    </Form.Field>
                    <Form.Field style={estimatedValueStyles}>Estimated Efficiency: 90%</Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    )
  }
}

export default inject('store')(observer(EquipmentCard))
