import * as React from 'react'
// import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Elements/Loader'
import { Loader } from 'semantic-ui-react'
import { setHeaderStyles } from './tableStyles'
import { greyColors } from '../../utils/constants'
import { formatDateForTable } from '../../utils/helpers'

class ApplianceTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { activeAppliance } = this.props.store
    const headerStyle = setHeaderStyles(style, rowIndex, 'appliance')
    const keyOrder = _.keys(activeAppliance[0])
    const row = activeAppliance[rowIndex]
    const val = row[keyOrder[columnIndex]]
    if (keyOrder[columnIndex] === 'datetime') {
      return (
        <div key={key} style={headerStyle}>
          {formatDateForTable(val)}
        </div>
      )
    }
    return (
      <div key={key} style={headerStyle}>
        {val}
      </div>
    )
  }

  _rowHeight = ({ index }) => {
    return index === 0 ? 26 : 26
  }

  componentDidUpdate(prevProps) {
    const prevPath = _.get(prevProps, 'store.activeApplianceFileInfo.path')
    const nowPath = _.get(this.props, 'store.activeApplianceFileInfo.path')
    if (this.multigrid && prevPath === nowPath) {
      this.multigrid.forceUpdateGrids()
    }
  }

  render() {
    const { activeAppliance, applianceIsLoading, activeApplianceFileInfo } = this.props.store
    if (_.isEmpty(activeAppliance)) {
      return <LoaderSpinner />
    }
    const columnCount = _.size(_.keys(activeAppliance[0]))
    return (
      <div>
        <h3>
          {activeApplianceFileInfo.label}{' '}
          <small style={{ color: greyColors[1] }}>{activeApplianceFileInfo.description}</small>{' '}
          {applianceIsLoading ? <Loader active inline size="mini" /> : <span />}
        </h3>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              ref={c => (this.multigrid = c)}
              cellRenderer={this._cellRenderer}
              columnCount={columnCount}
              columnWidth={100}
              fixedColumnCount={1}
              fixedRowCount={2}
              height={700}
              rowCount={_.size(activeAppliance)}
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

export default inject('store')(observer(ApplianceTable))
