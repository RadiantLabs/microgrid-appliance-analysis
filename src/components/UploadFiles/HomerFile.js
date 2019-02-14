import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader } from 'semantic-ui-react'
import FileButton from 'components/Elements/FileButton'
import BatteryChargeTable from 'components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'
import BatteryModel from './BatteryModel'

class HomerFile extends React.Component {
  render() {
    const {
      fileIsSelected,
      isAnalyzingFile,
      batteryIsTrained,
      showAnalyzedResults,
      batteryMaxSoC,
      batteryMinSoC,
      batteryMaxEnergyContent,
      batteryMinEnergyContent,
      handleCancelUpload,
      handleFileSave,
      handleGridFileSelect,
    } = this.props.store.stagedGrid
    return (
      <div>
        <Header as="h2" attached="top">
          {!batteryIsTrained && (
            <FileButton
              content="Upload & Analyze HOMER File"
              icon="upload"
              size="small"
              color="blue"
              floated="right"
              onSelect={handleGridFileSelect}
              basic
            />
          )}
          {batteryIsTrained && (
            <Button
              content="Save HOMER File"
              icon="save"
              size="small"
              color="blue"
              floated="right"
              onClick={handleFileSave}
              basic
            />
          )}
          {fileIsSelected && (
            <Button floated="right" basic size="small" onClick={handleCancelUpload}>
              <Icon name="cancel" />
              Cancel
            </Button>
          )}
          Add HOMER File
          {isAnalyzingFile && (
            <Header.Subheader style={{ display: 'inline-block', marginLeft: '1rem' }}>
              Analyzing File <Loader active inline size="tiny" />
            </Header.Subheader>
          )}
        </Header>

        {showAnalyzedResults && (
          <Segment attached>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields />
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
                  <BatteryModel />
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
