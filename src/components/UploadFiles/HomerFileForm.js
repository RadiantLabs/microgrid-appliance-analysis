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

const HomerFormFields = inject('store')(
  observer(({ store }) => {
    return (
      <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              File Name <HelperPopup content={'TODO'} />
            </Table.Cell>
            <Table.Cell>
              <Input onChange={store.stagedGrid.onNameChange} value={store.stagedGrid.fileName} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Power Type <HelperPopup content={'AC ⚡ DC'} />
            </Table.Cell>
            <Table.Cell>{store.stagedGrid.powerType}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Battery Type <HelperPopup content={'TODO'} />
            </Table.Cell>
            <Table.Cell>{store.stagedGrid.batteryType}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              PV Type <HelperPopup content={'TODO'} />
            </Table.Cell>
            <Table.Cell>{store.stagedGrid.pvType}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Generator Type <HelperPopup content={'TODO'} />
            </Table.Cell>
            <Table.Cell>{store.stagedGrid.generatorType}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)

const HomerStatsTable = () => {
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
    const { stagedGrid } = this.props.store
    return (
      <div>
        <Header as="h2" attached="top">
          <FileButton
            content="Upload & Analyze HOMER File"
            icon="upload"
            size="small"
            color="blue"
            floated="right"
            onSelect={stagedGrid.onGridFileUpload}
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
                  <HomerFormFields
                    onNameChange={stagedGrid.onNameChange}
                    fileName={stagedGrid.fileName}
                  />
                </Grid.Column>
                <Grid.Column width={8}>
                  <HomerStatsTable grid={stagedGrid} />
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
