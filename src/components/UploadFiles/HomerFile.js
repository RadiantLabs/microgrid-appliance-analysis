import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader, Label } from 'semantic-ui-react'
import FileButton from 'src/components/Elements/FileButton'
import BatteryChargeTable from 'src/components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'
import BatteryModel from './BatteryModel'

const FileUploadErrors = ({ fileErrors }) => {
  if (_.isEmpty(fileErrors)) {
    return 'None Found'
  }
  return (
    <div>
      {_.map(fileErrors, error => {
        return <div key={error}>{error}</div>
      })}
    </div>
  )
}

class HomerFile extends React.Component {
  render() {
    const { stagedGrid } = this.props.store
    if (_.isEmpty(stagedGrid)) {
      return null
    }
    // TODO: gridStoreName="stagedGrid" should be dynamically set
    const {
      fileIsSelected,
      isAnalyzingFile,
      batteryIsTrained,
      showAnalyzedResults,
      fileErrors,
      fileWarnings,
      handleCancelUpload,
      handleFileSave,
      handleGridFileUpload,
    } = stagedGrid
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
              onSelect={handleGridFileUpload}
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
          <AnalyzedResults fileErrors={fileErrors} fileWarnings={fileWarnings} />
        )}
      </div>
    )
  }
}

export default inject('store')(observer(HomerFile))

const AnalyzedResults = ({ fileErrors, fileWarnings }) => {
  return (
    <Segment attached>
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <HomerFormFields />
          </Grid.Column>
          <Grid.Column width={8}>
            <BatteryChargeTable gridStoreName="stagedGrid" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}>
            <Label color={_.isEmpty(fileErrors) ? 'grey' : 'red'} basic>
              File Upload Errors
            </Label>
          </Grid.Column>
          <Grid.Column width={12}>
            <FileUploadErrors fileErrors={fileErrors} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}>
            <Label color={_.isEmpty(fileWarnings) ? 'grey' : 'orange'} basic>
              File Upload Warnings
            </Label>
          </Grid.Column>
          <Grid.Column width={12}>
            <FileUploadErrors fileErrors={fileWarnings} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <BatteryModel />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
}
