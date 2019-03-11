import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Button, Icon, Label, List } from 'semantic-ui-react'
import ApplianceFile from './ApplianceFile'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import FileInfoPopupContent from './FileInfoPopupContent'

const labelStyle = {
  background: 'none #fff',
  border: '1px solid rgba(34,36,38,.15)',
  color: 'rgba(0,0,0,.87)',
  boxShadow: 'none',
  marginTop: '1px',
}

class ApplianceFiles extends React.Component {
  handleAddFileClick = (event, data) => {
    event.preventDefault()
    this.props.store.createStagedGrid()
    this.props.store.setViewedApplianceId('staged')
  }

  handleFileNavClick = (fileId, event) => {
    event.preventDefault()
    this.props.store.setViewedApplianceId(fileId)
  }

  render() {
    const { viewedApplianceId, appliances, viewedApplianceIsStaged } = this.props.store
    const useBlankState = _.isEmpty(viewedApplianceId)
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu vertical fluid>
              <Menu.Item
                name="Add New Appliance Usage File"
                active={viewedApplianceIsStaged}
                onClick={this.handleAddFileClick}>
                Add New Appliance Usage File
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
              {_.map(appliances, file => {
                return (
                  <Menu.Item
                    key={file.fileInfo.id}
                    name={file.fileLabel}
                    style={{ minHeight: '60px' }}
                    active={viewedApplianceId === file.fileInfo.id}
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
            {useBlankState ? <ApplianceFileBlankState /> : <ApplianceFile />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(ApplianceFiles))

const ApplianceFileBlankState = () => {
  // TODO: log this state. It shouldn't show up
  return (
    <div>
      <Header as="h3">Appliance File Management</Header>
      <List size="large" bulleted>
        <List.Item>Add a new Appliance file</List.Item>
        <List.Item>View, edit or delete your existing Appliance files</List.Item>
      </List>
      <p>Click on the menu on the left to do any of these tasks</p>
    </div>
  )
}
