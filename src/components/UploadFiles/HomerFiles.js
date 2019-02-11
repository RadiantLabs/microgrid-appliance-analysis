import * as React from 'react'
import _ from 'lodash'
import { Grid, Table, Header, Menu, Button, Icon } from 'semantic-ui-react'
import HomerFileForm from './HomerFileForm'
import { HelperPopup } from 'components/Elements/HelperPopup'

const activeItem = 'coupons'
const handleItemClick = () => null
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
    fileIsSample: false,
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
            {_.isEmpty(file.fileWarnings) ? 'thumbs up' : file.fileWarnings.join(', ')}
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

const HomerFiles = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column width={4}>
        <Button basic fluid color="blue">
          <Icon name="plus" />
          Add New Homer File
        </Button>

        <Header as="h5" style={{ marginLeft: '0.7rem', marginTop: '2rem' }}>
          Previous HOMER Files
        </Header>
        <Menu vertical fluid>
          {_.map(fakeSavedHomerFiles, file => {
            return (
              <Menu.Item
                key={file.fileName}
                name={file.fileName}
                active={activeItem === file.fileName}
                onClick={handleItemClick}>
                <Header sub>{file.fileName}</Header>
                <HelperPopup
                  content={<FilePopupContent file={file} />}
                  position="right center"
                  wide={true}
                />
                <span>{file.fileDescription}</span>
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

export default HomerFiles
