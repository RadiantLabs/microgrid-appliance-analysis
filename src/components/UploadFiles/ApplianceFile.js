import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import {
  Grid,
  Header,
  Segment,
  Button,
  Icon,
  Loader,
  Label,
  Message,
  Checkbox,
  Form,
} from 'semantic-ui-react'
import FileButton from 'src/components/Elements/FileButton'
import BatteryChargeTable from 'src/components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'

const FileUploadErrors = ({ fileErrors }) => {
  if (_.isEmpty(fileErrors)) {
    return 'None Found'
  }
  return (
    <div>
      {_.map(fileErrors, error => (
        <div key={error}>{error}</div>
      ))}
    </div>
  )
}

const StagedFileHeader = inject('store')(
  observer(({ store }) => {
    const {
      fileIsSelected,
      isAnalyzingFile,
      handleGridFileUpload,
      batteryIsTrained,
    } = store.viewedAppliance
    const { cancelStagedGrid, saveStagedGrid } = store
    return (
      <div>
        <Header as="h3" attached="top" style={{ paddingBottom: '18px' }}>
          {!fileIsSelected && (
            <FileButton
              content="Upload & Analyze HOMER File"
              icon="upload"
              size="tiny"
              color="blue"
              floated="right"
              onSelect={handleGridFileUpload}
              basic
            />
          )}
          {fileIsSelected && (
            <Button
              content="Save HOMER File"
              icon="save"
              size="tiny"
              color="blue"
              floated="right"
              disabled={!batteryIsTrained}
              onClick={saveStagedGrid}
              basic
            />
          )}
          {fileIsSelected && (
            <Button floated="right" basic size="tiny" onClick={cancelStagedGrid}>
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
      </div>
    )
  })
)

class ApplianceFile extends React.Component {
  render() {
    const { viewedApplianceIsStaged, viewedAppliance } = this.props.store
    if (_.isEmpty(viewedAppliance)) {
      return <h3>Empty Viewed Appliance</h3> // log this
    }
    const {
      enabled,
      toggleAppliance,
      fileLabel,
      fileDescription,
      showAnalyzedResults,
      fileErrors,
      fileWarnings,
      isActiveAppliance,
    } = viewedAppliance
    return (
      <div>
        {viewedApplianceIsStaged && <StagedFileHeader />}
        {!viewedApplianceIsStaged && (
          <Header as="h3" attached="top">
            {fileLabel}
            {!isActiveAppliance && (
              <Checkbox
                toggle
                style={{ float: 'right' }}
                checked={enabled}
                onChange={toggleAppliance}
                label={enabled ? 'Disable Appliance' : 'Enable Appliance'}
              />
            )}
            <Header.Subheader>{fileDescription}</Header.Subheader>
          </Header>
        )}
        {!showAnalyzedResults && (
          <Message warning>
            <p>
              This app is in beta. You may have to re-upload files in the future when we update this
              app. Make sure to keep copies of your files.
            </p>
          </Message>
        )}
        {showAnalyzedResults && (
          <Segment attached>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields grid={viewedAppliance} />
                </Grid.Column>
                <Grid.Column width={8}>
                  <BatteryChargeTable grid={viewedAppliance} />
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
            </Grid>
          </Segment>
        )}
      </div>
    )
  }
}

export default inject('store')(observer(ApplianceFile))
