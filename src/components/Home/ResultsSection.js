import * as React from 'react'
import { Menu, Container } from 'semantic-ui-react'
import HomerTable from '../ResultTables/HomerTable'
import ApplianceTable from '../ResultTables/ApplianceTable'

const ActiveView = ({ viewName }) => {
  switch (viewName) {
    case 'combinedTable':
      return <h4>Combined Table</h4>
    case 'homerTable':
      return <HomerTable />
    case 'appliance1Table':
      return <ApplianceTable applianceIndex={1} />

    default:
      return <h4>Can't find view name: {viewName}</h4>
  }
}

class ResultsSection extends React.Component {
  state = {}

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
            name="appliance1Table"
            active={activeItem === 'appliance1Table'}
            content="Appliance 1 Table"
            onClick={this.handleItemClick}
          />
        </Menu>

        <Container>
          <ActiveView viewName={this.state.activeItem} />
        </Container>
      </div>
    )
  }
}

export default ResultsSection
