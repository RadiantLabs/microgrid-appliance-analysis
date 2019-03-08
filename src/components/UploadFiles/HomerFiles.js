import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Button, Icon, Label, List } from 'semantic-ui-react'
import HomerFile from './HomerFile'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import FileInfoPopupContent from './FileInfoPopupContent'

const labelStyle = {
  background: 'none #fff',
  border: '1px solid rgba(34,36,38,.15)',
  color: 'rgba(0,0,0,.87)',
  boxShadow: 'none',
  marginTop: '1px',
}

class HomerFiles extends React.Component {
  handleAddFileClick = (event, data) => {
    event.preventDefault()
    this.props.store.createStagedGrid()
    this.props.store.setViewedGridId('staged')
  }

  handleFileNavClick = (fileId, event) => {
    event.preventDefault()
    this.props.store.setViewedGridId(fileId)
  }

  render() {
    const {
      viewedGridId,
      activeGrid,
      availableGrids,
      viewedGridIsStaged,
      viewedGrid,
    } = this.props.store
    const useBlankState = _.isEmpty(viewedGridId)
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu vertical fluid>
              <Menu.Item
                name="Add New HOMER File"
                active={viewedGridIsStaged}
                onClick={this.handleAddFileClick}>
                Add New HOMER File
                <Button
                  icon
                  floated="right"
                  basic
                  compact
                  size="small"
                  style={{ marginTop: '-7px', marginRight: '-9px' }}>
                  <Icon name="plus" color="blue" />
                </Button>
              </Menu.Item>
            </Menu>
            <Menu vertical fluid>
              <Menu.Item
                key={activeGrid.fileInfo.id}
                name={activeGrid.fileLabel}
                active={viewedGridId === activeGrid.fileInfo.id}
                onClick={this.handleFileNavClick.bind(null, activeGrid.fileInfo.id)}>
                <Header sub>{activeGrid.fileLabel}</Header>
                <HelperPopup
                  content={<FileInfoPopupContent file={activeGrid} />}
                  position="right center"
                  wide={true}
                />
                <span>{activeGrid.fileDescription}</span>
                {activeGrid.fileInfo.isSample && (
                  <Label basic attached="top right" size="mini" style={labelStyle}>
                    Active, Sample
                  </Label>
                )}
              </Menu.Item>
              {_.map(availableGrids, (file, fileIndex) => {
                return (
                  <Menu.Item
                    key={file.fileInfo.id}
                    name={file.fileLabel}
                    active={viewedGridId === file.fileInfo.id}
                    onClick={this.handleFileNavClick.bind(null, file.fileInfo.id)}>
                    <Header sub>{file.fileLabel}</Header>
                    <HelperPopup
                      content={<FileInfoPopupContent file={file} />}
                      position="right center"
                      wide={true}
                    />
                    <span>{file.fileDescription}</span>
                    {file.fileInfo.isSample && (
                      <Label basic attached="top right" size="mini" style={labelStyle}>
                        Sample
                      </Label>
                    )}
                  </Menu.Item>
                )
              })}
            </Menu>
          </Grid.Column>
          <Grid.Column width={12}>
            {useBlankState ? <HomerFileBlankState /> : <HomerFile viewedGrid={viewedGrid} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(HomerFiles))

const HomerFileBlankState = () => {
  // TODO: log this state. It shouldn't show up
  return (
    <div>
      <Header as="h3">HOMER File Management</Header>
      <List size="large" bulleted>
        <List.Item>Add a new HOMER file</List.Item>
        <List.Item>View, edit or delete your existing HOMER files</List.Item>
      </List>
      <p>Click on the menu on the left to do any of these tasks</p>
    </div>
  )
}
