import React, { Component } from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Header } from 'semantic-ui-react'
import EquipmentCard from './EquipmentCard'

const EquipmentRowsByStatus = ({ compatibility, header, isFirst }) => {
  const cardStyle = {
    minHeight: '200px',
    marginTop: isFirst ? 0 : '40px',
  }
  return (
    <div style={cardStyle}>
      <Header as="h2" dividing>
        {header}
      </Header>
      {_.map(compatibility, (card, cardIndex) => {
        return <EquipmentCard equipment={card} key={`i${cardIndex}`} />
      })}
    </div>
  )
}

class EquipmentCards extends Component {
  render() {
    const { viewedAppliance } = this.props.store
    const { enabledAncillaryEquipmentLabels } = viewedAppliance
    const required = viewedAppliance.requiredAncillaryEquipment
    const useful = viewedAppliance.usefulAncillaryEquipment
    const notuseful = viewedAppliance.notusefulAncillaryEquipment
    if (!_.isArray(required) || !_.isArray(useful) || !_.isArray(notuseful)) {
      return <h4>Calculating AncillaryEquipment </h4>
    }
    const notEmptyMsg = (
      <span>
        <small>Enabled equipment for this appliance:</small>{' '}
        {enabledAncillaryEquipmentLabels.join(', ')}
      </span>
    )
    const emptyMsg = <small>You have no enabled ancillary equipment for this appliance</small>
    const enabledEquipmentMsg = _.isEmpty(enabledAncillaryEquipmentLabels) ? emptyMsg : notEmptyMsg
    return (
      <div>
        <Header style={{ marginBottom: 0 }}>{enabledEquipmentMsg}</Header>
        <p style={{ marginBottom: '35px', display: 'inline-block', fontSize: '14px' }}>
          Scroll down to see all equipment
        </p>
        <EquipmentRowsByStatus compatibility={required} header="Required Equipment" isFirst />
        <EquipmentRowsByStatus compatibility={useful} header="Equipment that may be useful" />
        <EquipmentRowsByStatus compatibility={notuseful} header="Incompatible Equipment" />
      </div>
    )
  }
}

export default inject('store')(observer(EquipmentCards))
