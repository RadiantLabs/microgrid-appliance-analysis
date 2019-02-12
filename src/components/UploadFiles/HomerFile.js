import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon } from 'semantic-ui-react'
import FileButton from 'components/Elements/FileButton'
import BatteryChargeTable from 'components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'

class HomerFile extends React.Component {
  state = {
    fileStaged: true,
    isModeling: true,
  }

  render() {
    const { fileStaged } = this.state
    const { stagedGrid } = this.props.store
    const {
      batteryMaxSoC,
      batteryMinSoC,
      batteryMaxEnergyContent,
      batteryMinEnergyContent,
    } = stagedGrid
    return (
      <div>
        <Header as="h2" attached="top">
          <FileButton
            content="Upload & Analyze HOMER File"
            icon="upload"
            size="small"
            color="blue"
            floated="right"
            onSelect={stagedGrid.onGridFileUpload}
            basic
          />
          <Button floated="right" basic size="small">
            <Icon name="cancel" />
            Cancel
          </Button>
          Add HOMER File
        </Header>
        {fileStaged && (
          <Segment attached>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields
                    onNameChange={stagedGrid.onNameChange}
                    fileName={stagedGrid.fileName}
                  />
                </Grid.Column>
                <Grid.Column width={8}>
                  <BatteryChargeTable
                    batteryMaxSoC={batteryMaxSoC}
                    batteryMinSoC={batteryMinSoC}
                    batteryMaxEnergyContent={batteryMaxEnergyContent}
                    batteryMinEnergyContent={batteryMinEnergyContent}
                  />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Battery Model</Header>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        )}
      </div>
    )
  }
}

export default inject('store')(observer(HomerFile))
