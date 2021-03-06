import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Button, Icon, Label, List } from 'semantic-ui-react'
import ApplianceFile from './ApplianceFile'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import ApplianceInfoPopupContent from './ApplianceInfoPopupContent'
import { logger } from '../../utils/logger'

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
    this.props.store.createStagedAppliance()
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
                name="Add Appliance Usage File"
                active={viewedApplianceIsStaged}
                onClick={this.handleAddFileClick}>
                Add Appliance Usage File
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
                const { fileInfo, description, label, enabled } = file
                return (
                  <Menu.Item
                    key={fileInfo.id}
                    name={label}
                    style={{ minHeight: '60px' }}
                    active={viewedApplianceId === fileInfo.id}
                    onClick={this.handleFileNavClick.bind(null, fileInfo.id)}>
                    <Header sub>{label}</Header>
                    <HelperPopup
                      content={<ApplianceInfoPopupContent file={file} />}
                      position="right center"
                      wide={true}
                    />
                    <p style={{ marginBottom: 0, fontSize: '0.9em', fontWeight: 300 }}>
                      {description}
                    </p>
                    {(fileInfo.isSample || enabled) && (
                      <Label
                        basic
                        attached="top right"
                        size="mini"
                        style={labelStyle}
                        color={enabled ? 'blue' : null}>
                        {enabled && 'Enabled'}
                        {fileInfo.isSample && enabled && ', '}
                        {fileInfo.isSample && 'Sample'}
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
  logger('Hit ApplianceFileBlankState which probably shouldnt happen')
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
