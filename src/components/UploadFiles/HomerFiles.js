import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Menu, Button, Icon, Label, List } from 'semantic-ui-react'
import HomerFile from './HomerFile'
import { HelperPopup } from 'components/Elements/HelperPopup'
import FileInfoPopupContent from './FileInfoPopupContent'

const labelStyle = {
  background: 'none #fff',
  border: '1px solid rgba(34,36,38,.15)',
  color: 'rgba(0,0,0,.87)',
  boxShadow: 'none',
  marginTop: '1px',
}

const fakeSavedHomerFiles = [
  {
    fileName: '12-50 Oversize 20',
    fileDescription: 'The original file, default',
    fileIsSample: true,
    fileSize: '4.2 MB',
    fileData: [{}, {}, {}],
    fileErrors: [],
    fileWarnings: [],
    pvType: 'Generic flat plate PV',
    powerType: 'AC',
    batteryType: 'Generic 1kWh Lead Acid [ASM]',
    generatorType: 'Not Found',
  },
  {
    fileName: '2-2-13 Optimized AC LA-gen Output',
    fileDescription: 'This is the one we really want',
    fileIsSample: false,
    fileSize: '3.9 MB',
    fileData: [{}, {}, {}],
    fileErrors: [],
    fileWarnings: [],
    pvType: 'Generic flat plate PV',
    powerType: 'DC',
    batteryType: 'Li-Ion Generic',
    generatorType: 'Not Found',
  },
  {
    fileName: '12-50 Undersize 10',
    fileDescription: 'This is not useful',
    fileIsSample: true,
    fileSize: '3.9 MB',
    fileData: [{}, {}, {}],
    fileErrors: [],
    fileWarnings: [],
    pvType: 'Sunerg',
    powerType: 'AC',
    batteryType: 'Generic 1kWh Li-Ion [ASM]',
    generatorType: 'Not Found',
  },
]

class HomerFiles extends React.Component {
  state = {
    activeNavId: null,
    isAddingFile: true,
    isAnalyzing: false,
    isSaving: false,
  }

  handleAddFileClick = (event, data) => {
    event.preventDefault()
    this.setState({ isAddingFile: true, activeNavId: null })
  }

  handleFileNavClick = (fileIndex, event, data) => {
    event.preventDefault()
    this.setState({ isAddingFile: false, activeNavId: fileIndex })
  }

  render() {
    const { activeNavId, isAddingFile, isAnalyzing, isSaving } = this.state
    const useBlankState = !_.some([_.isFinite(activeNavId), isAddingFile, isAnalyzing, isSaving])
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu vertical fluid>
              <Menu.Item
                name="Add New HOMER File"
                active={isAddingFile}
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
              {_.map(fakeSavedHomerFiles, (file, fileIndex) => {
                return (
                  <Menu.Item
                    key={file.fileName}
                    name={file.fileName}
                    active={activeNavId === fileIndex}
                    onClick={this.handleFileNavClick.bind(null, fileIndex)}>
                    <Header sub>{file.fileName}</Header>
                    <HelperPopup
                      content={<FileInfoPopupContent file={file} />}
                      position="right center"
                      wide={true}
                    />
                    <span>{file.fileDescription}</span>
                    {file.fileIsSample && (
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
            {useBlankState ? <HomerFileBlankState /> : <HomerFile />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(HomerFiles))

const HomerFileBlankState = () => {
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
