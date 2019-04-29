import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import {
  Dropdown,
  Header,
  Grid,
  Popup,
  Form,
  Table,
  Checkbox,
  Icon,
  Loader,
  Radio,
} from 'semantic-ui-react'
import InputField from '../../../components/Elements/InputField'

const ApplianceSelectionTrigger = inject('store')(
  observer(props => {
    const { store } = props
    const { appliancesAreLoading, enabledApplianceLabels } = store
    return (
      <div {..._.omit(props, ['loading'])} style={{ cursor: 'pointer' }}>
        {enabledApplianceLabels}
        {appliancesAreLoading ? (
          <Loader active inline size="tiny" style={{ paddingLeft: '26px' }} />
        ) : (
          <Icon name="dropdown" style={{ paddingLeft: '12px' }} />
        )}
      </div>
    )
  })
)

const ApplianceSelectionTable = inject('store')(
  observer(({ store }) => {
    const { appliances } = store
    return (
      <Table basic="very" compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Enable</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '200px' }}>Label</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '300px' }}>Description</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '120px' }}>Cost</Table.HeaderCell>
            <Table.HeaderCell collapsing>Cost Assignment</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(appliances, appliance => {
            const {
              fileInfo,
              label,
              description,
              capexAssignment,
              enabled,
              toggleAppliance,
              handleCapexAssignmentChange,
            } = appliance
            return (
              <Table.Row key={fileInfo.id}>
                <Table.Cell collapsing>
                  <Checkbox toggle checked={enabled} onChange={toggleAppliance} />
                </Table.Cell>
                <Table.Cell>{label}</Table.Cell>
                <Table.Cell>{description}</Table.Cell>
                <Table.Cell>
                  <InputField fieldKey="capex" modelInstance={appliance} />
                </Table.Cell>
                <Table.Cell>
                  <Form style={{ marginTop: '7px', marginBottom: '7px' }}>
                    <Form.Field>
                      <Radio
                        label="Appliance Owner"
                        name="radioGroup"
                        value="appliance"
                        checked={capexAssignment === 'appliance'}
                        onChange={handleCapexAssignmentChange}
                      />
                    </Form.Field>
                    <Form.Field style={{ marginBottom: 0 }}>
                      <Radio
                        label="Grid Owner"
                        name="radioGroup"
                        value="grid"
                        checked={capexAssignment === 'grid'}
                        style={{ marginBottom: '3px' }}
                        onChange={handleCapexAssignmentChange}
                      />
                    </Form.Field>
                  </Form>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    )
  })
)

class FileChoosers extends Component {
  setActiveGridFile = (event, data) => {
    event.preventDefault()
    this.props.store.setActiveGridFile(data.value)
  }

  render() {
    const {
      activeGrid,
      availableGrids,
      activeGridIsLoading,
      ancillaryEquipmentLabels,
    } = this.props.store

    const dropdownOptions = _.map(availableGrids, (grid, index) => {
      const isActive = grid.fileInfo.id === activeGrid.fileInfo.id
      return {
        key: grid.fileInfo.id,
        text: grid.label,
        value: grid.fileInfo.id,
        selected: isActive,
        onClick: this.setActiveGridFile,
        content: (
          <Header
            as="h5"
            icon={isActive ? 'square outline check' : 'square outline'}
            content={grid.label}
            subheader={grid.description}
          />
        ),
      }
    })
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Grid File:
            </Header>
            <Dropdown
              text={activeGrid.label}
              loading={activeGridIsLoading}
              options={dropdownOptions}
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Appliance Usage Profile:
            </Header>
            <Popup
              flowing
              trigger={<ApplianceSelectionTrigger />}
              content={<ApplianceSelectionTable />}
              on="click"
              position="bottom center"
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Selected Ancillary Equipment
            </Header>
            {ancillaryEquipmentLabels}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(FileChoosers))
