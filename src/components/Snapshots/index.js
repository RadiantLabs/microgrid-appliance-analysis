import * as React from 'react'
import { Grid, Container, Button, Table, Header, Icon } from 'semantic-ui-react'

// TODO:
// * Make Revert & Delete highlight on hover
// * Take page out of container so the table is wider
const Snapshots = () => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={12}>
          <Header as="h2" image>
            <Header.Content>
              Save a Snapshot
              <Header.Subheader>
                Save the current state of the application, including selector HOMER and appliance
                files, ancillary equipment and model inputs (we save everything).
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Grid.Column>
        <Grid.Column width={4}>
          <Button
            basic
            compact
            floated="right"
            color="blue"
            onClick={console.log('click')}
            style={{ verticalAlign: 'top', marginLeft: '1rem', marginTop: '4px' }}>
            <Icon name="camera" />
            Save Snapshot
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>

    <Header as="h2" image>
      <Header.Content>
        Revert to a Snapshot
        <Header.Subheader>
          If your current state is important, save a snapshot before reverting to an older snapshot.
        </Header.Subheader>
      </Header.Content>
    </Header>

    <Table basic="very" celled collapsing selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Time</Table.HeaderCell>
          <Table.HeaderCell>HOMER File</Table.HeaderCell>
          <Table.HeaderCell>Appliance File</Table.HeaderCell>
          <Table.HeaderCell>Ancillary Equipment</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Button icon basic size="small" color="blue">
              Revert
            </Button>
          </Table.Cell>
          <Table.Cell>Final Snapshot</Table.Cell>
          <Table.Cell>This contains the best settings</Table.Cell>
          <Table.Cell>Jan 15, 2019</Table.Cell>
          <Table.Cell>8:03am (MST)</Table.Cell>
          <Table.Cell>12-50 Oversize 20</Table.Cell>
          <Table.Cell>Rice Mill (Tanzania)</Table.Cell>
          <Table.Cell>AC to DC Power Converter, Direct On-line Starter</Table.Cell>
          <Table.Cell>
            <Button icon basic size="small" color="red">
              {/*<Icon name="delete" color="red" />*/}
              Delete
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </Container>
)

export default Snapshots
