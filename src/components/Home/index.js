import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Segment, Dropdown, Header, Table } from 'semantic-ui-react'
import ResultsSection from './ResultsSection'
import GridOperatorSummary from './GridOperatorSummary'
import ModelInputs from './ModelInputs'
import { homerFiles, applianceFiles } from '../../utils/fileInfo'

// const Home = ({ store }) => {
// console.log('store.setActiveHomerFile: ', store.setActiveHomerFile)

class Home extends Component {
  onHomerChange = (event, data) => {
    console.log(event)
    console.log(data)
    debugger
  }

  render() {
    const {
      store: { setActiveHomerFile },
    } = this.props
    return (
      <div>
        {/* Grid for Selecting HOMER and Appliance usage profiles */}
        <Table basic selectable>
          <Table.Body>
            <Table.Row>
              <Table.Cell collapsing>
                <Header as="h5">Select Grid Characteristics:</Header>
              </Table.Cell>
              <Table.Cell>
                <Dropdown text="TODO: Active Homer File">
                  <Dropdown.Menu>
                    {_.map(homerFiles, fileInfo => (
                      <Dropdown.Item
                        text={fileInfo.label}
                        key={fileInfo.path}
                        description={fileInfo.description}
                        // value={fileInfo.path}
                        // active={
                        //   fileInfo.path ===
                        //   './data/homer/homer_12_50_oversize_20_AS.csv'
                        // }
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
                <Dropdown text="Sample mill usage profile">
                  <Dropdown.Menu>
                    {_.map(applianceFiles, file => (
                      <Dropdown.Item
                        text={file.label}
                        key={file.path}
                        description={file.description}
                        // icon="check" // If currently active (or bold)
                      />
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        {/* Grid for Inputs, Grid Operator Summary and Appliance Operator Summary */}
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <h3>Inputs</h3>
                <ModelInputs />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Grid Operator Summary</h3>
                <GridOperatorSummary />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
                <h3>Appliance Operator Summary</h3>
                <p>Pellentesque habitant morbi tristique senectus.</p>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <ResultsSection />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(Home))
