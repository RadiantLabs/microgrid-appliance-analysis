import * as React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import * as _ from 'lodash'
import { AutoSizer, Grid } from 'react-virtualized'
import LoaderSpinner from '../Loader'

class Homer extends React.Component {
  render() {
    const { store } = this.props
    console.log('store: ', store)
    const { fetchState, homer } = store
    // console.log('homer: ', toJS(homer))
    const isLoaded = fetchState === 'loaded'
    return (
      <div className="ui centered grid">
        <div className="column">
          <h2>Homer</h2>
          {isLoaded ? <HomerTable homer={homer} /> : <LoaderSpinner />}
        </div>
      </div>
    )
  }
}

class HomerTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { homer } = this.props
    const keyOrder = _.keys(homer[0])
    const row = homer[rowIndex]
    return (
      <div key={key} style={style}>
        {row[keyOrder[columnIndex]]}
      </div>
    )
  }

  render() {
    const { homer } = this.props
    const homerJS = toJS(homer)
    // Make this an observable(?) and reorder columns at that point?
    const homerKeyOrder = _.keys(homer[0])
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            cellRenderer={this._cellRenderer}
            columnCount={10}
            columnWidth={100}
            height={height}
            rowCount={100}
            rowHeight={50}
            width={width}
          />
        )}
      </AutoSizer>
    )
  }
}

export default inject('store')(observer(Homer))
