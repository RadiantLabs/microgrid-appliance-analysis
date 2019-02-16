import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Dropdown, Header, Grid } from 'semantic-ui-react'
import { homerFiles, sampleApplianceFiles } from 'utils/fileInfo'

class FileChoosers extends Component {
  render() {
    const {
      store: {
        setActiveHomerFile,
        setActiveApplianceFile,
        activeGridInfo,
        activeApplianceInfo,
        homerIsLoading,
        activeApplianceIsLoading,
        ancillaryEquipment,
      },
    } = this.props
    const { enabledEquipmentList } = ancillaryEquipment
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Grid File:
            </Header>
            <Dropdown text={activeGridInfo.label} loading={homerIsLoading}>
              <Dropdown.Menu>
                {_.map(homerFiles, fileInfo => (
                  <Dropdown.Item
                    text={fileInfo.label}
                    key={fileInfo.fileName}
                    description={fileInfo.description}
                    value={fileInfo.fileName}
                    active={fileInfo.fileName === activeGridInfo.fileName}
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
            <Dropdown text={activeApplianceInfo.label} loading={activeApplianceIsLoading}>
              <Dropdown.Menu>
                {_.map(sampleApplianceFiles, fileInfo => (
                  <Dropdown.Item
                    text={fileInfo.label}
                    key={fileInfo.fileName}
                    description={fileInfo.description}
                    value={fileInfo.fileName}
                    active={fileInfo.fileName === activeApplianceInfo.fileName}
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
