import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Label, Checkbox } from 'semantic-ui-react'
import { HelperPopup } from '../Elements/HelperPopup'

class AncillaryEquipment extends Component {
  render() {
    const { ancillaryEquipmentOptions } = this.props.store
    console.log('ancillaryEquipmentOptions: ', ancillaryEquipmentOptions)
    return (
      <Grid celled basic>
        <Grid.Row>
          <Grid.Column width={2}>
            <Label color="black">Is Required</Label>
          </Grid.Column>
          <Grid.Column width={2}>
            Power Converter{' '}
            <HelperPopup
              content="A power converter converts AC power to DC power. An example may be converting AC grid electricity to power a fan driven by a DC motor"
              position="top right"
            />
          </Grid.Column>
          <Grid.Column width={4}>
            A power converter is required hardware for successful appliance operation
          </Grid.Column>
          <Grid.Column width={6}>Input controls</Grid.Column>
          <Grid.Column width={2}>
            <div style={{ float: 'right' }}>
              <Checkbox label="Enable" style={{ marginRight: 18 }} />
              <a href="#">Dismiss</a>
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={2}>
            <Label color="grey" basic>
              May Be Useful
            </Label>
          </Grid.Column>
          <Grid.Column width={2}>
            Soft Starter{' '}
            <HelperPopup
              content="A softstarter slowly ramps up AC voltage when starting a motor to reduce starting torque and provide inrush current relief. An example may be a softstarter upstream of a pump to limit inrush current and water hammer throughout a system."
              position="top right"
            />
          </Grid.Column>
          <Grid.Column width={4}>
            A soft starter may be useful to reduce in-rush current and starting torque and to
            provide motor protection
          </Grid.Column>
          <Grid.Column width={6}>Input controls</Grid.Column>
          <Grid.Column width={2}>
            <div style={{ float: 'right' }}>
              <Checkbox label="Enable" style={{ marginRight: 18 }} />
              <a href="#">Dismiss</a>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(AncillaryEquipment))
