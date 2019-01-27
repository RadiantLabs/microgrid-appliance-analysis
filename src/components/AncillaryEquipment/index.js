import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Header, Grid } from 'semantic-ui-react'
import EquipmentCard from './EquipmentCard'

class AncillaryEquipment extends Component {
  render() {
    const {
      ancillaryEquipmentStatus: { required, useful, notuseful },
    } = this.props.store
    return (
      <div>
        <EquipmentRowsByStatus status={required} header="Required Equipment" />
        <EquipmentRowsByStatus status={useful} header="Equipment that may be useful" />
        <EquipmentRowsByStatus status={notuseful} header="Incompatible Equipment" />
      </div>
    )
  }
}

export default inject('store')(observer(AncillaryEquipment))

const EquipmentRowsByStatus = ({ status, header }) => {
  return (
    <div>
      <Header as="h3" dividing>
        {header}
      </Header>
      <Grid columns="equal">
        {_.map(_.range(0, 9, 3), rowIndex => {
          return (
            <Grid.Row key={rowIndex}>
              <Grid.Column>
                <EquipmentCard equipmentInfo={status[rowIndex] || {}} />
              </Grid.Column>
              <Grid.Column>
                <EquipmentCard equipmentInfo={status[rowIndex + 1] || {}} />
              </Grid.Column>
              <Grid.Column>
                <EquipmentCard equipmentInfo={status[rowIndex + 2] || {}} />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    </div>
  )
}
