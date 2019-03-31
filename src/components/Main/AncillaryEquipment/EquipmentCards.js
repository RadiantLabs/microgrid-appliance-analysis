import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Header, Grid } from 'semantic-ui-react'
import EquipmentCard from './EquipmentCard'

const EquipmentRowsByStatus = ({ compatibility, header }) => {
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
                <EquipmentCard equipment={compatibility[rowIndex] || {}} />
              </Grid.Column>
              <Grid.Column>
                <EquipmentCard equipment={compatibility[rowIndex + 1] || {}} />
              </Grid.Column>
              <Grid.Column>
                <EquipmentCard equipment={compatibility[rowIndex + 2] || {}} />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    </div>
  )
}

class EquipmentCards extends Component {
  render() {
    const { viewedAppliance } = this.props.store
    const required = viewedAppliance.requiredAncillaryEquipment
    const useful = viewedAppliance.usefulAncillaryEquipment
    const notuseful = viewedAppliance.notusefulAncillaryEquipment
    if (!_.isArray(required) || !_.isArray(useful) || !_.isArray(notuseful)) {
      return <h4>Calculating AncillaryEquipment </h4>
    }
    return (
      <div>
        <EquipmentRowsByStatus compatibility={required} header="Required Equipment" />
        <EquipmentRowsByStatus compatibility={useful} header="Equipment that may be useful" />
        <EquipmentRowsByStatus compatibility={notuseful} header="Incompatible Equipment" />
      </div>
    )
  }
}

export default inject('store')(observer(EquipmentCards))
