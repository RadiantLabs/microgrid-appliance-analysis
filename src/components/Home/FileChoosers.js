import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Dropdown, Header, Table } from 'semantic-ui-react'
import { homerFiles, applianceFiles } from '../../utils/fileInfo'

// TODO: Render file description
// const activeFileDisplay = fileInfo => {
//   debugger
//   return (
//     <div>
//       {fileInfo.label}
//       <small>{fileInfo.description}</small>
//     </div>
//   )
// }

class FileChoosers extends Component {
  render() {
    const {
      store: {
        setActiveHomerFile,
        setActiveApplianceFile,
        activeHomerFileInfo,
        activeApplianceFileInfo,
      },
    } = this.props
    return (
      <Table basic="very" selectable className="fileChooser">
        <Table.Body>
          <Table.Row>
            <Table.Cell collapsing>
              <Header as="h5">Select Grid Characteristics:</Header>
            </Table.Cell>
            <Table.Cell>
              {/* TODO: loading */}
              <Dropdown text={activeHomerFileInfo.label}>
                <Dropdown.Menu>
                  {_.map(homerFiles, fileInfo => (
                    <Dropdown.Item
                      text={fileInfo.label}
                      key={fileInfo.path}
                      description={fileInfo.description}
                      value={fileInfo.path}
                      active={fileInfo.path === activeHomerFileInfo.path}
                      onClick={setActiveHomerFile}
                      // icon="check" // If currently active (or bold)
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell collapsing>
              <Header as="h5">Select Appliance Usage Profile:</Header>
            </Table.Cell>
            <Table.Cell>
              <Dropdown text={activeApplianceFileInfo.label}>
                <Dropdown.Menu>
                  {_.map(applianceFiles, fileInfo => (
                    <Dropdown.Item
                      text={fileInfo.label}
                      key={fileInfo.path}
                      description={fileInfo.description}
                      value={fileInfo.path}
                      active={fileInfo.path === activeApplianceFileInfo.path}
                      onClick={setActiveApplianceFile}
                      // icon="check" // If currently active (or bold)
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default inject('store')(observer(FileChoosers))
