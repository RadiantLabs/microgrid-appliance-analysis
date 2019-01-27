import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { List, Checkbox, Input, Popup, Icon } from 'semantic-ui-react'
import {
  columnHeaderByTableType,
  // calculatedColumnHeaders,
  // homerHeaders,
  // applianceHeaders,
} from 'utils/columnHeaders'
import { tableColorsByKey } from 'utils/constants'
import styles from './styles.module.css'

/**
 * Column Header Legend
 */
const setLegendStyles = tableName => {
  return {
    paddingRight: '4px',
    paddingLeft: '4px',
    fontStyle: 'italic',
    fontSize: '11px',
    lineHeight: 1.8,
    cursor: 'pointer',
    backgroundColor: tableColorsByKey[tableName],
  }
}

const ColumnLegend = inject('store')(
  observer(({ store }) => {
    return (
      <div style={{ width: 130, float: 'right' }}>
        <div
          style={setLegendStyles('calculatedColumns')}
          // onClick={store.setMultipleExcludedTableColumns(calculatedColumnHeaders)}
        >
          Calculated Columns
          {/*<Icon name="circle outline" style={{ float: 'right' }} />*/}
        </div>
        <div
          style={setLegendStyles('homer')}
          // onClick={store.setMultipleExcludedTableColumns(homerHeaders)}
        >
          HOMER Columns {/*<Icon name="circle outline" style={{ float: 'right' }} />*/}
        </div>
        <div
          style={setLegendStyles('appliance')}
          // onClick={store.setMultipleExcludedTableColumns(applianceHeaders)}
        >
          Appliance Columns
          {/*<Icon name="check circle outline" style={{ float: 'right' }} />*/}
        </div>
      </div>
    )
  })
)

/**
 * Selected Column Indicator
 */
const selectorBoxStyles = {
  cursor: 'pointer',
  float: 'right',
  marginRight: '2%',
  marginTop: '4px',
  width: 'calc(88% - 130px)',
  verticalAlign: 'top',
}

const SelectedColumnIndicator = inject('store')(
  observer(({ store, column, excludedColumns, columnWidth, ...rest }) => {
    const tableType = excludedColumns.has(column) ? 'excluded' : columnHeaderByTableType[column]
    return (
      <div
        {...rest}
        className={styles.columnIndicator}
        onClick={() => store.setExcludedTableColumns(column)}
        style={{
          display: 'inline-block',
          width: columnWidth,
          height: '20px',
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
        <strong>
          Select Columns <small>({percentTableColumnsShowing}% columns showing)</small>
        </strong>{' '}
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
        <ColumnLegend />
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
                    checked={!excludedTableColumns.has(header)}
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
