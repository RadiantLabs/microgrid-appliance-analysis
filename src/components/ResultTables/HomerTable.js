import * as React from 'react'
// import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Elements/Loader'
import { setHeaderStyles } from './tableStyles'
import { greyColors } from '../../utils/constants'

class HomerTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { activeHomer } = this.props.store
    const keyOrder = _.keys(activeHomer[0])
    const headerStyle = setHeaderStyles(style, rowIndex, 'homer')
    const row = activeHomer[rowIndex]
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
    const columnCount = _.size(_.keys(activeHomer[0]))
    return (
      <div>
        <h3>
          {' '}
          <small style={{ color: greyColors[1] }}>TODO: Show homer column stats</small>
        </h3>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={this._cellRenderer}
              columnCount={columnCount}
              columnWidth={100}
              fixedColumnCount={1}
              fixedRowCount={2}
              height={700}
              rowCount={_.size(activeHomer)}
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
