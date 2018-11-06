import * as React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Loader'

class Homer extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { homerTableData, homerKeyOrder } = this.props.store
    const headerStyle = setHeaderStyles(style, rowIndex)
    const row = homerTableData[rowIndex]
    return (
      <div key={key} style={headerStyle}>
        {row[homerKeyOrder[columnIndex]]}
      </div>
    )
  }

  _rowHeight = ({ index }) => {
    return index === 0 ? 76 : 26
  }

  render() {
    const { homer, homerKeyOrder, homerIsLoaded } = this.props.store
    return (
      <div className="ui centered grid">
        <div className="column">
          <h2>Homer</h2>
          {!homerIsLoaded ? (
            <LoaderSpinner />
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <MultiGrid
                  cellRenderer={this._cellRenderer}
                  columnCount={_.size(homerKeyOrder)}
                  columnWidth={100}
                  fixedColumnCount={1}
                  fixedRowCount={2}
                  height={700}
                  rowCount={_.size(homer)}
                  rowHeight={this._rowHeight}
                  estimatedRowSize={26}
                  width={width}
                />
              )}
            </AutoSizer>
          )}
        </div>
      </div>
    )
  }
}

export default inject('store')(observer(Homer))

// rowIndex === 1 ? { ...style, ...{ fontStyle: 'italic' } } : style
// { color: '#605f5f' }
function setHeaderStyles(styles, rowIndex) {
  let rowStyles = styles
  if (rowIndex === 0 || rowIndex === 1) {
    rowStyles = {
      ...rowStyles,
      ...{
        fontStyle: 'italic',
        backgroundColor: '#f9fafb',
      },
    }
  }
  if (rowIndex === 0) {
    rowStyles = {
      ...rowStyles,
      ...{ borderTop: '1px solid rgba(34,36,38,.1)' },
    }
  }
  if (rowIndex === 1) {
    rowStyles = {
      ...rowStyles,
      ...{ borderBottom: '1px solid rgba(34,36,38,.1)' },
    }
  }
  return rowStyles
}
