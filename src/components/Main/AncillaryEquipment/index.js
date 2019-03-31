import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Label, List } from 'semantic-ui-react'
import { HelperPopup } from '../../Elements/HelperPopup'
import ApplianceInfoPopupContent from '../../UploadFiles/ApplianceInfoPopupContent'
import EquipmentCards from './EquipmentCards'

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
    const { viewedApplianceId, appliances } = this.props.store
    const useBlankState = _.isEmpty(viewedApplianceId)
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4}>
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
                    <span>{description}</span>
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
            {useBlankState ? <ApplianceFileBlankState /> : <EquipmentCards />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(ApplianceFiles))

// TODO: log this state. It shouldn't show up
const ApplianceFileBlankState = () => {
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
