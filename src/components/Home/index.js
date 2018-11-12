import * as React from 'react'
import { Grid, Segment, Dropdown, Header, Table } from 'semantic-ui-react'
import ResultsSection from './ResultsSection'
import GridOperatorSummary from './GridOperatorSummary'
import ModelInputs from './ModelInputs'

const Home = () => (
  <div>
    {/* Grid for Selecting HOMER and Appliance usage profiles */}
    <Table basic selectable>
      <Table.Body>
        <Table.Row>
          <Table.Cell collapsing>
            <Header as="h5">Select Grid Characteristics:</Header>
          </Table.Cell>
          <Table.Cell>
            <Dropdown text="HOMER 12_50 oversize 20 AS">
              <Dropdown.Menu>
                <Dropdown.Item text="New" />
                <Dropdown.Item text="Open..." description="ctrl + o" />
                <Dropdown.Item text="Save as..." description="ctrl + s" />
                <Dropdown.Item text="Rename" description="ctrl + r" />
                <Dropdown.Item text="Make a copy" />
                <Dropdown.Item icon="folder" text="Move to folder" />
                <Dropdown.Item icon="trash" text="Move to trash" />
                <Dropdown.Divider />
                <Dropdown.Item text="Download As..." />
                <Dropdown.Item text="Publish To Web" />
                <Dropdown.Item text="E-mail Collaborators" />
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
                <Dropdown.Item text="New" />
                <Dropdown.Item text="Open..." description="ctrl + o" />
                <Dropdown.Item text="Save as..." description="ctrl + s" />
                <Dropdown.Item text="Rename" description="ctrl + r" />
                <Dropdown.Item text="Make a copy" />
                <Dropdown.Item icon="folder" text="Move to folder" />
                <Dropdown.Item icon="trash" text="Move to trash" />
                <Dropdown.Divider />
                <Dropdown.Item text="Download As..." />
                <Dropdown.Item text="Publish To Web" />
                <Dropdown.Item text="E-mail Collaborators" />
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

export default Home
