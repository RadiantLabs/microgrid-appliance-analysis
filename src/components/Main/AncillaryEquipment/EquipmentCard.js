import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Card, Form, Checkbox, Grid, Header, Table } from 'semantic-ui-react'
import { HelperPopup } from '../../../components/Elements/HelperPopup'
import { AncillaryEquipmentDiagram } from './EquipmentDiagram'
import InputField from '../../../components/Elements/InputField'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'

class EquipmentCard extends Component {
  render() {
    if (_.isEmpty(this.props.equipment)) {
      return null
    }
    const { equipment } = this.props
    const {
      equipmentType,
      label,
      description,
      enabled,
      compatibilityMessage,
      compatibility,
      estimatedCapex,
      estimatedEfficiency,
      parentApplianceSize,
      capexAssignment,
      handleEnabledToggle,
      handleCapexAssignmentChange,
    } = equipment
    const isRequired = compatibility === 'required'
    const toggleLabel = isRequired ? 'Required' : enabled ? 'Enabled' : 'Enable'
    return (
      <Card fluid className={enabled ? 'activeCardBorder' : ''}>
        <Card.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Header has="h3" style={{ marginTop: '4px', marginBottom: '4px' }}>
                  {label}{' '}
                  <small>
                    <HelperPopup content={description} position="right center" />
                  </small>
                  <span style={compatibilityStyle}>{compatibilityLabels[compatibility]}</span>
                </Header>
              </Grid.Column>
              <Grid.Column width={4} textAlign="right">
                <div style={{ marginLeft: 10, float: 'right' }}>
                  <Checkbox
                    toggle
                    label={toggleLabel}
                    checked={enabled}
                    // disabled={isRequired ? true : null}
                    onChange={handleEnabledToggle}
                  />
                </div>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={7}>
                <Card.Description>{compatibilityMessage}</Card.Description>
                <AncillaryEquipmentDiagram equipmentType={equipmentType} />
              </Grid.Column>

              <Grid.Column width={9}>
                <Form>
                  <Table basic="very" className="borderless">
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>
                          <InputField
                            fieldKey="equipmentSize"
                            modelInstance={equipment}
                            labelLeft={`${shortLabels[equipment.equipmentType]} Size`}
                            labelRight={fieldDefinitions['equipmentSize'].units}
                            size="mini"
                          />
                        </Table.Cell>
                        <Table.Cell style={estimatedValueStyles}>
                          Appliance Size: {parentApplianceSize} kW
                        </Table.Cell>
                      </Table.Row>

                      <Table.Row>
                        <Table.Cell>
                          <InputField
                            fieldKey="capex"
                            modelInstance={equipment}
                            labelLeft={`${shortLabels[equipment.equipmentType]} Cost`}
                            labelRight="USD"
                            size="mini"
                          />
                        </Table.Cell>
                        <Table.Cell style={estimatedValueStyles}>
                          Estimated Cost: ${estimatedCapex}
                        </Table.Cell>
                      </Table.Row>

                      <Table.Row>
                        <Table.Cell>
                          <InputField
                            fieldKey="efficiencyRating"
                            modelInstance={equipment}
                            labelLeft={`${shortLabels[equipment.equipmentType]} Efficiency`}
                            // labelRight="-"
                            size="mini"
                          />
                        </Table.Cell>
                        <Table.Cell style={estimatedValueStyles}>
                          Estimated Efficiency: {_.round(estimatedEfficiency * 100, 1)}%
                        </Table.Cell>
                      </Table.Row>

                      <Table.Row>
                        <Table.Cell colSpan={2}>
                          <div>
                            <div
                              style={{
                                display: 'inline-block',
                                verticalAlign: 'top',
                                marginRight: '10px',
                                paddingLeft: '4px',
                              }}>
                              Cost Assignment
                            </div>
                            <div style={{ display: 'inline-block' }}>
                              <Form.Field>
                                <Form.Radio
                                  label="Appliance Owner"
                                  name="radioGroup"
                                  value="appliance"
                                  checked={capexAssignment === 'appliance'}
                                  onChange={handleCapexAssignmentChange}
                                />
                              </Form.Field>
                              <Form.Field>
                                <Form.Radio
                                  label="Grid Owner"
                                  name="radioGroup"
                                  value="grid"
                                  checked={capexAssignment === 'grid'}
                                  onChange={handleCapexAssignmentChange}
                                />
                              </Form.Field>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell />
                      </Table.Row>
                    </Table.Body>
                  </Table>
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

const estimatedValueStyles = {
  marginTop: '4px',
  fontStyle: 'italic',
  fontSize: '0.9em',
}

const compatibilityStyle = {
  fontSize: '12px',
  fontWeight: 300,
  fontStyle: 'italic',
}

const shortLabels = {
  powerConverter: 'Converter',
  inverter: 'Inverter',
  vfd: 'VFD',
  softStarter: 'Starter',
  directOnlineStarter: 'Starter',
  starDeltaStarter: 'Starter',
  capacitorBank: 'Capacitor',
  threeFourPointDcMotorStarter: 'Starter',
}

const compatibilityLabels = {
  required: 'Required',
  useful: 'May be useful',
  notuseful: 'Incompatible',
}
