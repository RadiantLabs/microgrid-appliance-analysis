import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Dropdown, Header, Table } from 'semantic-ui-react'
// import LoaderSpinner from 'components/Elements/Loader'
import { homerFiles, applianceFiles } from 'utils/fileInfo'

class FileChoosers extends Component {
  render() {
    const {
      store: {
        setActiveHomerFile,
        setActiveApplianceFile,
        activeHomerFileInfo,
        activeApplianceFileInfo,
        homerIsLoading,
        applianceIsLoading,
      },
    } = this.props
    return (
      <Table basic="very" className="fileChooser" style={{ padding: 12 }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell collapsing>
              <Header as="h5">Select Grid File:</Header>
            </Table.Cell>
            <Table.Cell>
              {/* TODO: loading */}
              <Dropdown text={activeHomerFileInfo.label} loading={homerIsLoading}>
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
            <Table.Cell collapsing>
              <Header as="h5">Select Appliance Usage Profile:</Header>
            </Table.Cell>
            <Table.Cell>
              <Dropdown text={activeApplianceFileInfo.label} loading={applianceIsLoading}>
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
