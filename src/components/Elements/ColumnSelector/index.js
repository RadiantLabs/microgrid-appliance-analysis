import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { List, Checkbox, Input, Popup, Icon } from 'semantic-ui-react'
import { columnHeaderByTableType } from '../../../utils/columnHeaders'
import { tableColorsByKey } from '../../../utils/constants'
import styles from './styles.module.css'

/**
 * Selected Column Indicator
 */
const selectorBoxStyles = {
  cursor: 'pointer',
  marginRight: '2%',
  marginTop: '4px',
  width: '100%',
  verticalAlign: 'top',
}

const SelectedColumnIndicator = inject('store')(
  observer(({ store, column, excludedColumns, columnWidth, ...rest }) => {
    const tableType = _.includes(excludedColumns, column)
      ? 'excluded'
      : columnHeaderByTableType[column]
    return (
      <div
        {...rest}
        className={styles.columnIndicator}
        onClick={() => store.setExcludedTableColumns(column)}
        style={{
          display: 'inline-block',
          width: columnWidth,
          height: '12px',
          backgroundColor: tableColorsByKey[tableType],
        }}
      />
    )
  })
)

const ColumnSelectorPopup = ({ columns, excludedColumns, ...rest }) => {
  const columnWidth = `${(1 / _.size(columns)) * 100}%`
  return (
    <div {...rest} style={selectorBoxStyles}>
      <div>
        {_.map(columns, column => (
          <Popup
            trigger={
              <SelectedColumnIndicator
                column={column}
                excludedColumns={excludedColumns}
                columnWidth={columnWidth}
              />
            }
            key={column}
            size="tiny"
            position="bottom center">
            <span>{column}</span>
          </Popup>
        ))}
      </div>
    </div>
  )
}

/**
 * Header that shows title and percent of columns showing
 */
const ColumnSelectorHeader = ({ percentTableColumnsShowing, ...rest }) => {
  return (
    <div {...rest} style={selectorBoxStyles}>
      <div>
        <em>Select Columns ({percentTableColumnsShowing}% columns showing)</em>{' '}
        <Icon name="pencil alternate" />
      </div>
    </div>
  )
}

/**
 * Wrapper exported component
 */
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
    const columnName = data.label.props.children
    this.props.store.setExcludedTableColumns(columnName)
  }

  render() {
    const { searchString } = this.state
    const { headers, store } = this.props
    const { excludedTableColumns, percentTableColumnsShowing } = store
    const searchFilteredHeaders = _.filter(headers, header => {
      return _.includes(header.toLowerCase(), searchString)
    })
    return (
      <div>
        <Popup
          trigger={<ColumnSelectorHeader percentTableColumnsShowing={percentTableColumnsShowing} />}
          basic
          flowing
          position="bottom left"
          verticalOffset={14}
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
            {_.map(searchFilteredHeaders, header => {
              return (
                <List.Item key={header}>
                  <Checkbox
                    label={<label>{header}</label>}
                    onChange={this.handleCheckChange}
                    checked={!_.includes(excludedTableColumns, header)}
                  />
                </List.Item>
              )
            })}
          </List>
        </Popup>
        <ColumnSelectorPopup columns={headers} excludedColumns={excludedTableColumns} />
      </div>
    )
  }
}

export default inject('store')(observer(ColumnSelector))
