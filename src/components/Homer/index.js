import * as React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Loader'

class Homer extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { homer, homerKeyOrder } = this.props.store
    const row = homer[rowIndex]
    return (
      <div key={key} style={style}>
        {row[homerKeyOrder[columnIndex]]}
      </div>
    )
  }

  render() {
    const { fetchState, homer, homerKeyOrder } = this.props.store
    const isLoaded = fetchState === 'loaded'
    return (
      <div className="ui centered grid">
        <div className="column">
          <h2>Homer</h2>
          {!isLoaded ? (
            <LoaderSpinner />
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <MultiGrid
                  cellRenderer={this._cellRenderer}
                  columnCount={_.size(homerKeyOrder)}
                  columnWidth={100}
                  fixedColumnCount={2}
                  fixedRowCount={1}
                  height={700}
                  rowCount={_.size(homer)}
                  rowHeight={50}
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
