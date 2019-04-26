import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader, Message, Checkbox } from 'semantic-ui-react'
import FileButton from '../../components/Elements/FileButton'
import ApplianceFormFields from './ApplianceFormFields'
import ApplianceDataTable from './ApplianceDataTable'
import { ApplianceFileInstructions } from './ApplianceFileInstructions'

const ApplianceEnabler = inject('store')(
  observer(({ store }) => {
    const { viewedAppliance } = store
    const { enabled, toggleAppliance } = viewedAppliance
    return (
      <div>
        <div>Enable Appliance</div>
        <Checkbox
          toggle
          className="toggleFieldWrapper"
          style={{ marginTop: '6px' }}
          checked={enabled}
          onChange={toggleAppliance}
          label={enabled ? 'Enabled' : 'Disabled'}
        />
      </div>
    )
  })
)

const DeleteAppliance = inject('store')(
  observer(({ store }) => {
    const { viewedAppliance, deleteApplianceFile } = store
    const { fileInfo, label } = viewedAppliance
    const { isSample, id } = fileInfo
    return (
      <Segment>
        <Header>Danger Zone</Header>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              {isSample &&
                'Delete this sample appliance file. The only way to retrieve this file in the future is delete all data to reset the app. There will be no confirmation.'}
              {!isSample && 'Delete this appliance file. There will be no confirmation.'}
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                basic
                compact
                color="red"
                floated="right"
                style={{ marginTop: '-8px' }}
                onClick={deleteApplianceFile.bind(null, id)}>
                Delete {label}
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  })
)

const StagedFileHeader = inject('store')(
  observer(({ store }) => {
    const {
      fileIsSelected,
      isAnalyzingFile,
      handleApplianceFileUpload,
      fileReadyToSave,
      fileImportErrors,
    } = store.viewedAppliance
    const { saveStagedAppliance, cancelStagedAppliance } = store
    return (
      <div>
        <Header as="h2" attached="top" style={{ paddingBottom: '18px' }}>
          {!fileIsSelected && (
            <FileButton
              content="Upload & Analyze Appliance File"
              icon="upload"
              size="tiny"
              color="blue"
              floated="right"
              onSelect={handleApplianceFileUpload}
              basic
            />
          )}
          {fileIsSelected && (
            <>
              <Button
                content="Save Appliance File"
                icon="save"
                size="tiny"
                color="blue"
                floated="right"
                disabled={!fileReadyToSave}
                onClick={saveStagedAppliance}
                basic
              />
              <Button floated="right" basic size="tiny" onClick={cancelStagedAppliance}>
                <Icon name="cancel" />
                Cancel
              </Button>
              {!_.isEmpty(fileImportErrors) && (
                <>
                  <div className="saveFileMessageErrorStyle">
                    Resolve errors with the imported file before saving
                  </div>
                  <br />
                </>
              )}
              {!fileReadyToSave && (
                <div className="saveFileMessageStyle">Fill out all fields before saving file</div>
              )}
            </>
          )}
          Add Appliance File
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
    const { label, description, enabled, showAnalyzedResults } = viewedAppliance
    return (
      <div>
        {viewedApplianceIsStaged && <StagedFileHeader />}
        {!viewedApplianceIsStaged && (
          <Segment attached="top" className={enabled ? 'activeFileBorderNoBottom' : null}>
            <Grid>
              <Grid.Column floated="left" width={12}>
                <Header as="h2">
                  {label}
                  <Header.Subheader>{description}</Header.Subheader>
                </Header>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <ApplianceEnabler />
              </Grid.Column>
            </Grid>
          </Segment>
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
          <>
            <Segment attached className={enabled ? 'activeFileBorderNoTop' : null}>
              <ApplianceFormFields />
            </Segment>
            <ApplianceDataTable />
            {!viewedApplianceIsStaged && <DeleteAppliance />}
          </>
        )}
        {!showAnalyzedResults && <ApplianceFileInstructions />}
      </div>
    )
  }
}

export default inject('store')(observer(ApplianceFile))
