import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader, Message, Checkbox } from 'semantic-ui-react'
import FileButton from '../../components/Elements/FileButton'
import ApplianceFormFields from './ApplianceFormFields'
import ApplianceDataTable from './ApplianceDataTable'

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
        <Header as="h2" attached="top" style={{ paddingBottom: '18px' }}>
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
    const { label, description, enabled } = viewedAppliance
    return (
      <div>
        {viewedApplianceIsStaged && <StagedFileHeader />}
        <Segment attached="top" className={enabled ? 'activeFileBorderNoBottom' : null}>
          {!viewedApplianceIsStaged && (
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
          )}
        </Segment>
        {viewedApplianceIsStaged && (
          <Message warning>
            <p>
              This app is in beta. You may have to re-upload files in the future when we update this
              app. Make sure to keep copies of your files.
            </p>
          </Message>
        )}
        <Segment attached className={enabled ? 'activeFileBorderNoTop' : null}>
          <ApplianceFormFields />
        </Segment>
        <ApplianceDataTable />
      </div>
    )
  }
}

export default inject('store')(observer(ApplianceFile))
