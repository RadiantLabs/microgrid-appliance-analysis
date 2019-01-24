import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Segment } from 'semantic-ui-react'

class AncillaryEquipment extends Component {
  render() {
    const { ancillaryEquipmentOptions } = this.props.store
    console.log('ancillaryEquipmentOptions: ', ancillaryEquipmentOptions)
    return <div>list of ancillary equipment</div>
  }
}

export default inject('store')(observer(AncillaryEquipment))
