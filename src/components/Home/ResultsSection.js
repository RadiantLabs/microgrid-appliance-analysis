import * as React from 'react'
import { Menu, Grid } from 'semantic-ui-react'
import HomerTable from '../ResultTables/HomerTable'
import ApplianceTable from '../ResultTables/ApplianceTable'
import CombinedTable from '../ResultTables/CombinedTable'

const ActiveView = ({ viewName }) => {
  switch (viewName) {
    case 'combinedTable':
      return <CombinedTable />
    case 'homerTable':
      return <HomerTable />
    case 'appliance0Table':
      return <ApplianceTable applianceIndex={0} />
    default:
      return <h4>Can't find view name: {viewName}</h4>
  }
}

class ResultsSection extends React.Component {
  state = { activeItem: 'appliance0Table' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Menu>
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
            name="appliance0Table"
            active={activeItem === 'appliance0Table'}
            content="Appliance 0 Table"
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
