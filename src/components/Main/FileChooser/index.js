import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Dropdown, Header, Grid } from 'semantic-ui-react'

class FileChoosers extends Component {
  setActiveGridFile = (event, data) => {
    event.preventDefault()
    this.props.store.setActiveGridFile(data.value)
  }

  render() {
    const {
      activeGrid,
      availableGrids,
      activeGridIsLoading,
      activeAppliance,
      availableAppliances,
      activeApplianceIsLoading,
      setActiveApplianceFile,
      ancillaryEquipment,
    } = this.props.store
    const { enabledEquipmentList } = ancillaryEquipment
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Grid File:
            </Header>
            <Dropdown text={activeGrid.fileLabel} loading={activeGridIsLoading}>
              <Dropdown.Menu>
                {_.map(availableGrids, grid => (
                  <Dropdown.Item
                    text={grid.fileLabel}
                    key={grid.fileInfo.id}
                    description={grid.fileDescription}
                    value={grid.fileInfo.id}
                    active={grid.fileInfo.id === activeGrid.fileInfo.id}
                    onClick={this.setActiveGridFile}
                    // icon="check" // If currently active (or bold)
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Appliance Usage Profile:
            </Header>
            <Dropdown text={activeAppliance.fileLabel} loading={activeApplianceIsLoading}>
              <Dropdown.Menu>
                {_.map(availableAppliances, appliance => (
                  <Dropdown.Item
                    text={appliance.fileLabel}
                    key={appliance.fileInfo.id}
                    description={appliance.fileDescription}
                    value={appliance.fileInfo.id}
                    active={appliance.fileInfo.id === activeAppliance.fileInfo.id}
                    onClick={setActiveApplianceFile}
                    // icon="check" // If currently active (or bold)
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Selected Ancillary Equipment
            </Header>
            {!_.isEmpty(enabledEquipmentList) && enabledEquipmentList.join(', ')}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(FileChoosers))
