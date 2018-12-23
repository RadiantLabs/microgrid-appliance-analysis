import * as React from 'react'
import { Menu, Grid } from 'semantic-ui-react'
import HomerTable from '../ResultTables/HomerTable'
import ApplianceTable from '../ResultTables/ApplianceTable'
import CombinedTable from '../ResultTables/CombinedTable'
import UnmetLoadsChart from '../ResultTables/UnmetLoadsChart'
import AvailableLoadChart from '../ResultTables/AvailableLoadChart'
import BatteryEnergyContentChart from '../ResultTables/BatteryEnergyContentChart'

const ActiveView = ({ viewName }) => {
  switch (viewName) {
    case 'availableLoadChart':
      return <AvailableLoadChart />
    case 'unmetLoadChart':
      return <UnmetLoadsChart />
    case 'batteryEnergyContentChart':
      return <BatteryEnergyContentChart />
    case 'combinedTable':
      return <CombinedTable />
    case 'homerTable':
      return <HomerTable />
    case 'applianceTable':
      return <ApplianceTable />
    default:
      return <h4>Can't find view name: {viewName}</h4>
  }
}

class ResultsSection extends React.Component {
  state = { activeItem: 'homerTable' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Menu pointing style={{ marginBottom: '0.2rem' }}>
          <Menu.Item
            name="availableLoadChart"
            active={activeItem === 'availableLoadChart'}
            content="Loads by Hour of Year"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="unmetLoadChart"
            active={activeItem === 'unmetLoadChart'}
            content="Unmet Loads By Hour"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="combinedTable"
            active={activeItem === 'combinedTable'}
            content="Combined Table"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="homerTable"
            active={activeItem === 'homerTable'}
            content="HOMER Table"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="applianceTable"
            active={activeItem === 'applianceTable'}
            content="Appliance Table"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="batteryEnergyContentChart"
            active={activeItem === 'batteryEnergyContentChart'}
            content="Battery Energy Content"
            onClick={this.handleItemClick}
          />
        </Menu>

        <Grid padded>
          <Grid.Column>
            <ActiveView viewName={this.state.activeItem} />
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default ResultsSection
