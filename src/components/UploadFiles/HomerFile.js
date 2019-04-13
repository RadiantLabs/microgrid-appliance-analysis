import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment, Button, Icon, Loader, Message } from 'semantic-ui-react'
import FileButton from '../../components/Elements/FileButton'
import BatteryChargeTable from '../../components/Elements/BatteryChargeTable'
import HomerFormFields from './HomerFormFields'
import BatteryModel from './BatteryModel'

const StagedFileHeader = inject('store')(
  observer(({ store, viewedGrid }) => {
    const { fileIsSelected, isAnalyzingFile, handleGridFileUpload, fileReadyToSave } = viewedGrid
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
              {!fileReadyToSave && (
                <div
                  style={{ float: 'right', fontSize: '12px', fontWeight: 300, marginRight: '4px' }}>
                  Fill out all fields before saving file
                </div>
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
          <Segment attached className={isActive ? 'activeFileBorderNoTop' : null}>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields />
                </Grid.Column>
                <Grid.Column width={8}>
                  <BatteryChargeTable grid={viewedGrid} />
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
