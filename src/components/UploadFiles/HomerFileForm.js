import * as React from 'react'
import { observer, inject } from 'mobx-react'
import {
  Table,
  Grid,
  Select,
  Header,
  Segment,
  Input,
  Button,
  Icon,
  // Loader,
} from 'semantic-ui-react'
import FileButton from 'components/Elements/FileButton'
import { HelperPopup } from 'components/Elements/HelperPopup'
import borderlessTableStyles from 'styles/borderlessTableStyles.module.css'

const HomerFormFields = ({}) => {
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            File Name <HelperPopup content={'TODO'} />
          </Table.Cell>
          <Table.Cell>
            <Input />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} />
          </Table.Cell>
          <Table.Cell>
            <Select
              options={[
                { key: 'AC', value: 'AC', text: 'AC' },
                { key: 'DC', value: 'DC', text: 'DC' },
              ]}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Battery Type <HelperPopup content={'TODO'} />
          </Table.Cell>
          <Table.Cell>
            <Input />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            PV Type <HelperPopup content={'TODO'} />
          </Table.Cell>
          <Table.Cell>
            <Input />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Generator Type <HelperPopup content={'TODO'} />
          </Table.Cell>
          <Table.Cell>
            <Input />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

const HomerStatsTable = ({}) => {
  return (
    <Table basic="very" celled>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Battery Max Charge</Table.Cell>
          <Table.Cell>TODO</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Min Charge</Table.Cell>
          <Table.Cell>TODO</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Battery Min Effective Charge</Table.Cell>
          <Table.Cell>use existing table</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

class HomerFileForm extends React.Component {
  state = {
    fileStaged: true,
    isModeling: true,
  }

  render() {
    const { fileStaged } = this.state
    const { onHomerFileUpload } = this.props.store.grid
    return (
      <div>
        <Header as="h2" attached="top">
          <FileButton
            content="Upload & Analyze HOMER File"
            icon="upload"
            size="small"
            color="blue"
            floated="right"
            onSelect={onHomerFileUpload}
            basic
          />
          <Button floated="right" basic size="small">
            <Icon name="cancel" />
            Cancel
          </Button>
          Add HOMER File
        </Header>
        {fileStaged && (
          <Segment attached>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <HomerFormFields />
                </Grid.Column>
                <Grid.Column width={8}>
                  <HomerStatsTable />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Battery Model</Header>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        )}
      </div>
    )
  }
}

export default inject('store')(observer(HomerFileForm))
