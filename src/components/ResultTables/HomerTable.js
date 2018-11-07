import * as React from 'react'
// import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Loader'
import { setHeaderStyles } from './tableStyles'

class HomerTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const {
      activeHomer: { tableData, keyOrder },
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

  render() {
    const { activeHomer } = this.props.store
    if (_.isEmpty(activeHomer)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h5>Homer</h5>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={this._cellRenderer}
              columnCount={_.size(activeHomer.keyOrder)}
              columnWidth={100}
              fixedColumnCount={2}
              fixedRowCount={2}
              height={700}
              rowCount={_.size(activeHomer.tableData)}
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

export default inject('store')(observer(HomerTable))
