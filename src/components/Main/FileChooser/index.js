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
  Input,
} from 'semantic-ui-react'

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
      activeAppliance,
      availableAppliances,
      activeApplianceIsLoading,
      setActiveApplianceFile,
      ancillaryEquipment,
    } = this.props.store
    const { enabledEquipmentList } = ancillaryEquipment
    return (
      <Grid columns="equal" padded>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Grid File:
            </Header>
            <Dropdown text={activeGrid.fileLabel} loading={activeGridIsLoading}>
              <Dropdown.Menu>
                {_.map(availableGrids, grid => (
                  <Dropdown.Item
                    text={grid.fileLabel}
                    key={grid.fileInfo.id}
                    description={grid.fileDescription}
                    value={grid.fileInfo.id}
                    active={grid.fileInfo.id === activeGrid.fileInfo.id}
                    onClick={this.setActiveGridFile}
                    // icon="check" // If currently active (or bold)
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Select Appliance Usage Profile:
            </Header>
            <Popup
              flowing
              trigger={<ApplianceSelectionTrigger loading={activeApplianceIsLoading} />}
              content={<ApplianceSelectionTable />}
              on="click"
              position="bottom center"
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5" style={{ marginBottom: 4 }}>
              Selected Ancillary Equipment
            </Header>
            {!_.isEmpty(enabledEquipmentList) && enabledEquipmentList.join(', ')}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(FileChoosers))

const ApplianceSelectionTrigger = props => {
  const { loading } = props
  return (
    <div {..._.omit(props, ['loading'])} style={{ cursor: 'pointer' }}>
      This is the selected appliance 20
      {loading ? (
        <Loader active inline size="tiny" style={{ paddingLeft: '12px' }} />
      ) : (
        <Icon name="dropdown" style={{ paddingLeft: '12px' }} />
      )}
    </div>
  )
}

const ApplianceSelectionTable = props => (
  <Table basic="very" compact>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Enable</Table.HeaderCell>
        <Table.HeaderCell>Label</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
        <Table.HeaderCell style={{ width: '120px' }}>Cost</Table.HeaderCell>
        <Table.HeaderCell>Cost Assignment</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox toggle checked />
        </Table.Cell>
        <Table.Cell>Rice Mill</Table.Cell>
        <Table.Cell>A longer rice mill description</Table.Cell>
        <Table.Cell>
          <Input
            fluid
            value={2000}
            // onChange={this.handleChange}
            // onBlur={this.handleBlur}
            error={false}
            size="small"
            label={{ basic: true, content: '$' }}
            labelPosition="left"
          />
        </Table.Cell>
        <Table.Cell>
          <Form style={{ marginTop: '7px', marginBottom: '7px' }}>
            <Form.Field style={{ marginBottom: 0 }}>
              <Radio
                label="Grid Owner"
                name="radioGroup"
                value="this"
                checked={true}
                style={{ marginBottom: '3px' }}
                // onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Appliance Owner"
                name="radioGroup"
                value="that"
                checked={false}
                // onChange={this.handleChange}
              />
            </Form.Field>
          </Form>
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox toggle />
        </Table.Cell>
        <Table.Cell>Maize Mill 1</Table.Cell>
        <Table.Cell>A longer maize mill 1 description</Table.Cell>
        <Table.Cell>
          <Input
            fluid
            value={2000}
            // onChange={this.handleChange}
            // onBlur={this.handleBlur}
            error={false}
            size="small"
            label={{ basic: true, content: '$' }}
            labelPosition="left"
          />
        </Table.Cell>
        <Table.Cell>
          <Form style={{ marginTop: '7px', marginBottom: '7px' }}>
            <Form.Field style={{ marginBottom: 0 }}>
              <Radio
                label="Grid Owner"
                name="radioGroup"
                value="this"
                checked={true}
                style={{ marginBottom: '3px' }}
                // onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Appliance Owner"
                name="radioGroup"
                value="that"
                checked={false}
                // onChange={this.handleChange}
              />
            </Form.Field>
          </Form>
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox toggle />
        </Table.Cell>
        <Table.Cell>Water Pump</Table.Cell>
        <Table.Cell>A longer water pump description</Table.Cell>
        <Table.Cell>
          <Input
            fluid
            value={2000}
            // onChange={this.handleChange}
            // onBlur={this.handleBlur}
            error={false}
            size="small"
            label={{ basic: true, content: '$' }}
            labelPosition="left"
          />
        </Table.Cell>
        <Table.Cell>
          <Form style={{ marginTop: '7px', marginBottom: '7px' }}>
            <Form.Field style={{ marginBottom: 0 }}>
              <Radio
                label="Grid Owner"
                name="radioGroup"
                value="this"
                checked={true}
                style={{ marginBottom: '3px' }}
                // onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Appliance Owner"
                name="radioGroup"
                value="that"
                checked={false}
                // onChange={this.handleChange}
              />
            </Form.Field>
          </Form>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
)

/* <Dropdown text={activeAppliance.fileLabel} loading={activeApplianceIsLoading}>
<Dropdown.Menu>
  {_.map(availableAppliances, appliance => (
    <Dropdown.Item
      text={appliance.fileLabel}
      key={appliance.fileInfo.id}
      description={appliance.fileDescription}
      value={appliance.fileInfo.id}
      active={appliance.fileInfo.id === activeAppliance.fileInfo.id}
      onClick={setActiveApplianceFile}
      // icon="check" // If currently active (or bold)
    />
  ))}
</Dropdown.Menu>
</Dropdown> */
