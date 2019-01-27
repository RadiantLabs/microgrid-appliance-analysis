import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Header, Grid } from 'semantic-ui-react'
import EquipmentCard from './EquipmentCard'

class AncillaryEquipment extends Component {
  render() {
    const {
      ancillaryEquipmentOptions: { required, useful, notuseful },
    } = this.props.store
    console.log('required: ', required)
    return (
      <div>
        <Header as="h2" dividing>
          Required Equipment
        </Header>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <EquipmentCard equipmentInfo={required[0] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={required[1] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={required[2] || {}} />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h2" dividing>
          Equipment that may be useful
        </Header>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <EquipmentCard equipmentInfo={useful[0] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={useful[1] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={useful[2] || {}} />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Header as="h2" dividing>
          Incompatible Equipment
        </Header>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <EquipmentCard equipmentInfo={notuseful[0] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={notuseful[1] || {}} />
            </Grid.Column>
            <Grid.Column>
              <EquipmentCard equipmentInfo={notuseful[2] || {}} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(AncillaryEquipment))
