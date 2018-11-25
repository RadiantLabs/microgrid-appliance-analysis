import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Elements/Loader'
import { Loader, Grid } from 'semantic-ui-react'
import { setHeaderStyles, setLegendStyles } from './tableStyles'
import { greyColors } from '../../utils/constants'
import { formatDateForTable } from '../../utils/helpers'

function getCurrentTable(columnIndex, calculatedColumnCount, applianceColumnCount) {
  switch (true) {
    // Render the calculatedColumn table as the initial columns
    case columnIndex < calculatedColumnCount:
      return 'calculatedColumns'

    // Then render only 1 column from the appliance table (kw_factor)
    case columnIndex < calculatedColumnCount + applianceColumnCount:
      return 'appliance'

    // Render everything from HOMER as the last column set
    default:
      return 'homer'
  }
}

// For now, only render kw_factor
const applianceColumnCount = 1

class CombinedTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { activeHomer, activeAppliance, calculatedColumns } = this.props.store
    const homerColumnHeaders = _.keys(activeHomer[0])
    const calculatedColumnHeaders = _.keys(calculatedColumns[0])
    const calculatedColumnCount = _.size(calculatedColumnHeaders)
    const currentTable = getCurrentTable(columnIndex, calculatedColumnCount, applianceColumnCount)

    if (currentTable === 'calculatedColumns') {
      if (calculatedColumnHeaders[columnIndex] === 'datetime') {
        return (
          <div key={key} style={setHeaderStyles(style, rowIndex, 'calculatedColumns')}>
            {formatDateForTable(calculatedColumns[rowIndex][calculatedColumnHeaders[columnIndex]])}
          </div>
        )
      }
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'calculatedColumns')}>
          {calculatedColumns[rowIndex][calculatedColumnHeaders[columnIndex]]}
        </div>
      )
    }

    if (currentTable === 'appliance') {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'appliance')}>
          {activeAppliance[rowIndex]['kw_factor']}
        </div>
      )
    }

    if (currentTable === 'homer') {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'homer')}>
          {activeHomer[rowIndex][homerColumnHeaders[columnIndex - calculatedColumnCount]]}
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
    if (_.isEmpty(calculatedColumns) || _.isEmpty(activeHomer)) {
      return <LoaderSpinner />
    }
    const rowCount = _.size(calculatedColumns)
    const columnCount =
      _.size(_.keys(calculatedColumns[0])) + _.size(_.keys(activeHomer[0])) + applianceColumnCount
    return (
      <div>
        <Grid>
          <Grid.Column floated="left" width={5}>
            <h3>
              {activeHomerFileInfo.label}{' '}
              <small style={{ color: greyColors[1] }}>{activeHomerFileInfo.description}</small>{' '}
              {homerIsLoading ? <Loader active inline size="mini" /> : <span />}
            </h3>
          </Grid.Column>

          {/* <Grid.Column floated="right" width={5} textAlign="right">
            <div style={{ width: 130, marginBottom: '0.4rem', float: 'right' }}>
              <div style={setLegendStyles('calculatedColumns')}>Calculated Columns</div>
              <div style={setLegendStyles('appliance')}>Appliance Columns</div>
              <div style={setLegendStyles('homer')}>HOMER Columns</div>
            </div>
          </Grid.Column> */}
        </Grid>

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
