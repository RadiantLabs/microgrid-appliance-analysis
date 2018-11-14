import * as React from 'react'
// import { toJS } from 'mobx'
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
      combinedTable: { tableData, keyOrder },
    } = this.props.store
    const headerStyle = setHeaderStyles(style, rowIndex)
    const row = tableData[rowIndex]
    return (
      <div key={key} style={headerStyle}>
        {row[keyOrder[columnIndex]]}
      </div>
    )
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
    if (this.multigrid) {
      this.multigrid.forceUpdateGrids()
    }
  }

  render() {
    const { store } = this.props
    const {
      combinedTable,
      homerIsLoading,
      // activeApplianceFileInfo,
      activeHomerFileInfo,
    } = store

    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h3>
          {activeHomerFileInfo.label}{' '}
          <small style={{ color: greyColors[1] }}>
            {activeHomerFileInfo.description}
          </small>{' '}
          {homerIsLoading ? <Loader active inline size="mini" /> : <span />}
        </h3>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              ref={c => (this.multigrid = c)}
              cellRenderer={this._cellRenderer}
              columnCount={_.size(combinedTable.keyOrder)}
              columnWidth={100}
              fixedColumnCount={2}
              fixedRowCount={2}
              height={700}
              rowCount={_.size(combinedTable.tableData)}
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
