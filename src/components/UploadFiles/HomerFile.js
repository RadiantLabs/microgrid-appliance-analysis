import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader, Message, Divider } from 'semantic-ui-react'
import FileButton from '../../components/Elements/FileButton'
import BatteryChargeTable from '../../components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'
import BatteryModel from './BatteryModel'
import { FileUploadErrors } from './FileUploadErrors'
import { redErrorFontColor } from '../../utils/constants'
// import BatteryDebugChart from '../Charts/BatteryDebugChart'

const DeleteGrid = inject('store')(
  observer(({ store }) => {
    const { viewedGrid, deleteGridFile } = store
    const { fileInfo, label } = viewedGrid
    const { isSample, id } = fileInfo
    return (
      <Segment>
        <Header>Danger Zone</Header>

        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              {isSample &&
                'Delete this sample HOMER file. The only way to retrieve this file in the future is delete all data to reset the app. There will be no confirmation.'}
              {!isSample && 'Delete this HOMER file. There will be no confirmation.'}
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                basic
                compact
                color="red"
                floated="right"
                style={{ marginTop: '-8px' }}
                onClick={deleteGridFile.bind(null, id)}>
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
  observer(({ store, viewedGrid }) => {
    const {
      fileIsSelected,
      isAnalyzingFile,
      handleGridFileUpload,
      fileReadyToSave,
      fileImportErrors,
    } = viewedGrid
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
            <>
              <Button
                content="Save HOMER File"
                icon="save"
                size="tiny"
                color="blue"
                floated="right"
                disabled={!fileReadyToSave}
                onClick={saveStagedGrid}
                basic
              />
              <Button floated="right" basic size="tiny" onClick={cancelStagedGrid}>
                <Icon name="cancel" />
                Cancel
              </Button>
              {!_.isEmpty(fileImportErrors) && (
                <>
                  <div style={errorFontStyles}>
                    Errors with the imported file need to be resolved before saving
                  </div>
                  <br />
                </>
              )}
              {!fileReadyToSave && (
                <div style={saveFileMessageStyle}>Fill out all fields before saving file</div>
              )}
            </>
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

class HomerFile extends React.Component {
  handleActivateGrid = () => {
    const viewedGridId = _.get(this, 'props.viewedGrid.fileInfo.id')
    this.props.store.setActiveGridFile(viewedGridId)
  }

  render() {
    const { viewedGrid } = this.props
    const { fileImportErrors, fileImportWarnings } = viewedGrid
    if (_.isEmpty(viewedGrid)) {
      return <h2>Empty Viewed Grid</h2> // log this
    }
    const { viewedGridIsStaged } = this.props.store
    const { label, description, showAnalyzedResults, isActive } = viewedGrid
    return (
      <div>
        {viewedGridIsStaged && <StagedFileHeader viewedGrid={viewedGrid} />}
        {!viewedGridIsStaged && (
          <Header as="h2" attached="top" className={isActive ? 'activeFileBorderNoBottom' : null}>
            {label}
            {!isActive && (
              <Button
                floated="right"
                basic
                size="tiny"
                onClick={this.handleActivateGrid}
                color="blue">
                Make Grid Active
              </Button>
            )}
            <Header.Subheader>{description}</Header.Subheader>
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
          <>
            <Segment attached className={isActive ? 'activeFileBorderNoTop' : null}>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={10}>
                    <HomerFormFields />
                  </Grid.Column>
                  <Grid.Column width={6}>
                    <BatteryChargeTable grid={viewedGrid} />
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column width={4}>File Upload Warnings</Grid.Column>
                  <Grid.Column width={12}>
                    <FileUploadErrors fileImportErrors={fileImportWarnings} level="warning" />
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column width={4}>File Upload Warnings</Grid.Column>
                  <Grid.Column width={12}>
                    <FileUploadErrors fileImportErrors={fileImportErrors} level="error" />
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column>
                    <BatteryModel grid={viewedGrid} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Divider />
              {/*<BatteryDebugChart />*/}
            </Segment>
            {!viewedGridIsStaged && <DeleteGrid />}
          </>
        )}
      </div>
    )
  }
}

export default inject('store')(observer(HomerFile))

const saveFileMessageStyle = {
  float: 'right',
  fontSize: '12px',
  fontWeight: 300,
  marginRight: '4px',
}

const errorFontStyles = {
  ...saveFileMessageStyle,
  ...{ color: redErrorFontColor },
}
