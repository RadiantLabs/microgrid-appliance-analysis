import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Dropdown, Header, Grid } from 'semantic-ui-react'
import { homerFiles, applianceFiles } from 'utils/fileInfo'

class FileChoosers extends Component {
  render() {
    const {
      store: {
        setActiveHomerFile,
        setActiveApplianceFile,
        activeHomerFileInfo,
        activeApplianceFileInfo,
        homerIsLoading,
        applianceIsLoading,
        enabledAncillaryEquipmentList,
      },
    } = this.props
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Grid File:
            </Header>
            <Dropdown text={activeHomerFileInfo.label} loading={homerIsLoading}>
              <Dropdown.Menu>
                {_.map(homerFiles, fileInfo => (
                  <Dropdown.Item
                    text={fileInfo.label}
                    key={fileInfo.path}
                    description={fileInfo.description}
                    value={fileInfo.path}
                    active={fileInfo.path === activeHomerFileInfo.path}
                    onClick={setActiveHomerFile}
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
            <Dropdown text={activeApplianceFileInfo.label} loading={applianceIsLoading}>
              <Dropdown.Menu>
                {_.map(applianceFiles, fileInfo => (
                  <Dropdown.Item
                    text={fileInfo.label}
                    key={fileInfo.path}
                    description={fileInfo.description}
                    value={fileInfo.path}
                    active={fileInfo.path === activeApplianceFileInfo.path}
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
            {enabledAncillaryEquipmentList.join(', ')}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(FileChoosers))
