import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Header, Grid } from 'semantic-ui-react'
import EquipmentCard from './EquipmentCard'

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

class EquipmentCards extends Component {
  render() {
    const { viewedAppliance } = this.props.store
    const required = _.get(viewedAppliance, 'ancillaryEquipment.equipmentStatus.required')
    const useful = _.get(viewedAppliance, 'ancillaryEquipment.equipmentStatus.useful')
    const notuseful = _.get(viewedAppliance, 'ancillaryEquipment.equipmentStatus.notuseful')
    if (!_.isArray(required) || !_.isArray(useful) || !_.isArray(notuseful)) {
      return <h4>Calculating AncillaryEquipment </h4>
    }
    return (
      <div>
        <EquipmentRowsByStatus status={required} header="Required Equipment" />
        <EquipmentRowsByStatus status={useful} header="Equipment that may be useful" />
        <EquipmentRowsByStatus status={notuseful} header="Incompatible Equipment" />
      </div>
    )
  }
}

export default inject('store')(observer(EquipmentCards))
