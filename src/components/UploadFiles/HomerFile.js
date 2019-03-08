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
      {_.map(fileErrors, error => (
        <div key={error}>{error}</div>
      ))}
    </div>
  )
}

const StagedFileHeader = inject('store')(
  observer(({ store, viewedGrid }) => {
    const { fileIsSelected, isAnalyzingFile, handleGridFileUpload } = viewedGrid
    const { cancelStagedGrid, saveStagedGrid } = store
    return (
      <div>
        <Header as="h3" attached="top" style={{ paddingBottom: '20px' }}>
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

class HomerFile extends React.Component {
  handleGridFileEdit = () => {
    return null
  }

  render() {
    const { viewedGrid } = this.props
    if (_.isEmpty(viewedGrid)) {
      return <h3>Empty Viewed Grid</h3> // log this
    }
    const { viewedGridIsStaged } = this.props.store
    const { fileLabel, fileDescription, showAnalyzedResults, fileErrors, fileWarnings } = viewedGrid
    return (
      <div>
        {viewedGridIsStaged && <StagedFileHeader viewedGrid={viewedGrid} />}
        {!viewedGridIsStaged && (
          <Header as="h3" attached="top">
            {fileLabel}
            <Button floated="right" basic size="tiny" onClick={this.handleGridFileEdit}>
              Edit
            </Button>
            <Header.Subheader>{fileDescription}</Header.Subheader>
          </Header>
        )}
        {showAnalyzedResults && (
          <Segment attached>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields grid={viewedGrid} />
                </Grid.Column>
                <Grid.Column width={8}>
                  <BatteryChargeTable grid={viewedGrid} />
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
                  <BatteryModel grid={viewedGrid} />
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
