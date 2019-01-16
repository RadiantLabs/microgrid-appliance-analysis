import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { List, Checkbox, Input, Popup, Icon } from 'semantic-ui-react'

const selectorBox = {
  border: '1px solid rgba(34, 36, 38, 0.15)',
  cursor: 'pointer',
}

const ColumnSelectorPopup = ({ columns, ...rest }) => (
  <div {...rest} style={selectorBox}>
    <h5 style={{ margin: '10px' }}>
      Select Columns ({columns}) <small>100% columns showing</small>
    </h5>
  </div>
)

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
        trigger={<ColumnSelectorPopup columns={10} />}
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
