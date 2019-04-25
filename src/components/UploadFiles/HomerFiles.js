import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Button, Icon, Label, List } from 'semantic-ui-react'
import HomerFile from './HomerFile'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import GridInfoPopupContent from './GridInfoPopupContent'
import { logger } from '../../utils/logger'

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
    const { viewedGridId, availableGrids, viewedGridIsStaged, viewedGrid } = this.props.store
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
              {_.map(availableGrids, (file, fileIndex) => {
                const { isActive, fileInfo, description, label } = file
                return (
                  <Menu.Item
                    key={fileInfo.id}
                    name={label}
                    style={{ minHeight: '60px' }}
                    active={viewedGridId === fileInfo.id}
                    onClick={this.handleFileNavClick.bind(null, fileInfo.id)}>
                    <Header sub>{label}</Header>
                    <HelperPopup
                      content={<GridInfoPopupContent file={file} />}
                      position="right center"
                      wide={true}
                    />
                    <p style={{ marginBottom: 0, fontSize: '0.9em', fontWeight: 300 }}>
                      {description}
                    </p>
                    {(isActive || fileInfo.isSample) && (
                      <Label
                        basic
                        attached="top right"
                        size="mini"
                        style={labelStyle}
                        color={isActive ? 'blue' : null}>
                        {isActive && 'Active'}
                        {fileInfo.isSample && isActive && ', '}
                        {fileInfo.isSample && 'Sample'}
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
  logger('Hit HomerFileBlankState which probably shouldnt happen')
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
