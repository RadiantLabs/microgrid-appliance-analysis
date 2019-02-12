import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Table, Header, Menu, Button, Icon, Label } from 'semantic-ui-react'
import HomerFileForm from './HomerFileForm'
import { HelperPopup } from 'components/Elements/HelperPopup'

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

const FilePopupContent = ({ file }) => {
  return (
    <Table basic="very" celled inverted>
      <Table.Body>
        <Table.Row>
          <Table.Cell width={7}>File Size</Table.Cell>
          <Table.Cell width={9}>{file.fileSize}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>File Warnings</Table.Cell>
          <Table.Cell>
            {_.isEmpty(file.fileWarnings) ? 'None' : file.fileWarnings.join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>PV Type</Table.Cell>
          <Table.Cell>{file.pvType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Type</Table.Cell>
          <Table.Cell>{file.batteryType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Generator Type</Table.Cell>
          <Table.Cell>{file.generatorType}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

class HomerFiles extends React.Component {
  render() {
    const {
      isUploadingNewGridFile,
      setIsUploadingNewGridFile,
      gridFileNavActiveId,
      setGridFileNavActiveId,
    } = this.props.store
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu vertical fluid>
              <Menu.Item
                name="Add New HOMER File"
                active={isUploadingNewGridFile === true}
                onClick={setIsUploadingNewGridFile}>
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
                    active={gridFileNavActiveId === fileIndex}
                    onClick={setGridFileNavActiveId.bind(null, fileIndex)}>
                    <Header sub>{file.fileName}</Header>
                    <HelperPopup
                      content={<FilePopupContent file={file} />}
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
            <HomerFileForm />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(HomerFiles))
