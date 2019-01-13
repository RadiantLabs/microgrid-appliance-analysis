import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { List, Checkbox, Input, Popup, Segment, Icon } from 'semantic-ui-react'

class ColumnSelector extends React.Component {
  state = {
    searchString: '',
  }

  handleSearchChange = (e, { value }) => {
    e.preventDefault()
    this.setState({ searchString: value })
  }

  handleSearchClear = (e, data) => {
    e.preventDefault()
    this.setState({ searchString: '' })
  }

  handleCheckChange = (e, data) => {
    e.preventDefault()
    this.props.store.setExcludedTableColumns(data)
  }

  render() {
    const { searchString } = this.state
    const { headers, store } = this.props
    const { excludedTableColumns } = store
    const filteredHeaders = _.filter(headers, header => {
      return _.includes(header.toLowerCase(), searchString)
    })
    return (
      <Popup
        trigger={ColumnSelectorPopup}
        basic
        flowing
        position="bottom left"
        verticalOffset={-10}
        on="click">
        <Popup.Header>
          <Input
            icon={<Icon name="times" onClick={this.handleSearchClear} circular link />}
            placeholder="Search header titles"
            value={searchString}
            onChange={this.handleSearchChange}
          />
        </Popup.Header>
        <List selection verticalAlign="middle">
          {_.map(filteredHeaders, header => {
            return (
              <List.Item key={header}>
                <Checkbox
                  label={<label>{header}</label>}
                  onChange={this.handleCheckChange}
                  checked={!excludedTableColumns.has(header)}
                />
              </List.Item>
            )
          })}
        </List>
      </Popup>
    )
  }
}

export default inject('store')(observer(ColumnSelector))

const ColumnSelectorPopup = (
  <Segment>
    <h5>
      Select Columns <small>100% columns showing</small>
    </h5>
  </Segment>
)
