import * as React from 'react'
import { Grid, Segment, Menu, Container } from 'semantic-ui-react'
import Homer from '../Homer'

const ActiveView = ({ viewName }) => {
  switch (viewName) {
    case 'combinedTable':
      return <h4>Combined Table</h4>
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
            name="activeHomer"
            active={activeItem === 'activeHomer'}
            content="HOMER Table"
            onClick={this.handleItemClick}
          />

          <Menu.Item
            name="appliance1"
            active={activeItem === 'appliance1'}
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
