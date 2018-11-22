import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Elements/Loader'
import { Loader } from 'semantic-ui-react'
import { setHeaderStyles } from './tableStyles'
import { greyColors } from '../../utils/constants'

class CombinedTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const {
      activeHomer: { tableData: homer },
      calculatedColumns,
    } = this.props.store
    const headerStyle = setHeaderStyles(style, rowIndex)
    const homerColumnHeaders = _.keys(homer[0])
    const calculatedColumnHeaders = _.keys(calculatedColumns[0])
    const calculatedColumnCount = _.size(calculatedColumnHeaders)
    const currentTable = columnIndex < calculatedColumnCount ? 'calculatedColumns' : 'homer'

    if (currentTable === 'calculatedColumns') {
      return (
        <div key={key} style={headerStyle}>
          {calculatedColumns[rowIndex][calculatedColumnHeaders[columnIndex]]}
        </div>
      )
    }

    if (currentTable === 'homer') {
      return (
        <div key={key} style={headerStyle}>
          {homer[rowIndex][homerColumnHeaders[columnIndex - calculatedColumnCount]]}
        </div>
      )
    }
  }

  _rowHeight = ({ index }) => {
    return index === 0 ? 76 : 26
  }

  componentDidUpdate(prevProps) {
    // const appliance = 'store.activeApplianceFileInfo.path'
    // const homer = 'store.activeHomerFileInfo.path'
    // if (!this.multigrid) {
    //   return null
    // }
    // if (_.get(prevProps, appliance) === _.get(this.props, appliance)) {
    //   this.multigrid.forceUpdateGrids()
    // }
    // if (_.get(prevProps, homer) === _.get(this.props, homer)) {
    //   this.multigrid.forceUpdateGrids()
    // }

    // TODO: Can I make a calculated value for the 'schema' of the combined data
    // that this listens to?
    if (this.multigrid) {
      this.multigrid.forceUpdateGrids()
    }
  }

  render() {
    const { store } = this.props
    const { calculatedColumns, homerIsLoading, activeHomerFileInfo, activeHomer } = store
    if (_.isEmpty(calculatedColumns) || _.isEmpty(activeHomer.tableData)) {
      return <LoaderSpinner />
    }
    const rowCount = _.size(calculatedColumns)
    const columnCount =
      _.size(_.keys(calculatedColumns[0])) + _.size(_.keys(activeHomer.tableData[0]))
    return (
      <div>
        <h3>
          {activeHomerFileInfo.label}{' '}
          <small style={{ color: greyColors[1] }}>{activeHomerFileInfo.description}</small>{' '}
          {homerIsLoading ? <Loader active inline size="mini" /> : <span />}
        </h3>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              ref={c => (this.multigrid = c)}
              cellRenderer={this._cellRenderer}
              columnCount={columnCount}
              columnWidth={100}
              fixedColumnCount={2}
              fixedRowCount={2}
              height={700}
              rowCount={rowCount}
              rowHeight={this._rowHeight}
              estimatedRowSize={26}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default inject('store')(observer(CombinedTable))
