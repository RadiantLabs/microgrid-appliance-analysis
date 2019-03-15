import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import { Grid } from 'semantic-ui-react'
import LoaderSpinner from '../../components/Elements/Loader'
import { setHeaderStyles } from '../../styles/tableStyles'
import { formatDateForTable } from '../../utils/helpers'
import { columnHeaderByTableType } from '../../utils/columnHeaders'

class ApplianceDataTable extends React.Component {
  _cellRenderer = (headers, units, { columnIndex, key, rowIndex, style }) => {
    const { calculatedApplianceColumns } = this.props.store.viewedAppliance
    const headerRowCount = 2 // column header name and units
    const columnHeader = headers[columnIndex]
    const columnUnit = units[columnIndex]
    const tableType = columnHeaderByTableType[columnHeader]

    // Column header name
    if (rowIndex === 0) {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, tableType)}>
          {columnHeader}
        </div>
      )
    }

    // Column header units
    if (rowIndex === 1) {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, tableType)}>
          {columnUnit || 'missing'}
        </div>
      )
    }

    // All other rows
    if (columnHeader === 'datetime') {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, tableType)}>
          {formatDateForTable(calculatedApplianceColumns[rowIndex - headerRowCount][columnHeader])}
        </div>
      )
    }
    return (
      <div key={key} style={setHeaderStyles(style, rowIndex, tableType)}>
        {calculatedApplianceColumns[rowIndex - headerRowCount][columnHeader]}
      </div>
    )
  }

  _rowHeight = ({ index }) => {
    return index === 0 ? 76 : 26
  }

  // This table updates if the HOMER file, appliance or model inputs changes.
  // React Virtualized aggressively caches & prevents updates even for props changes
  componentDidUpdate(prevProps) {
    if (this.multigrid) {
      this.multigrid.forceUpdateGrids()
    }
  }

  render() {
    const { viewedAppliance } = this.props.store
    const { calculatedApplianceColumns, productionUnitType } = viewedAppliance
    if (_.isEmpty(viewedAppliance) || _.isEmpty(calculatedApplianceColumns)) {
      return <LoaderSpinner />
    }
    const applianceHeaders = [
      'datetime',
      'day',
      'day_hour',
      'hour',
      'hour_of_day',
      'kw_factor',
      'newApplianceLoad',
      'productionUnits',
      'productionUnitsRevenue',
      'production_factor',
    ]
    const applianceHeadersUnits = ['-', '-', '-', '-', '-', '-', 'kW', productionUnitType, '$']
    const rowCount = _.size(calculatedApplianceColumns)
    const columnCount = _.size(applianceHeaders)
    return (
      <Grid style={{ marginTop: '10px' }}>
        <Grid.Row>
          <Grid.Column width={16}>
            <AutoSizer>
              {({ height, width }) => (
                <MultiGrid
                  ref={c => (this.multigrid = c)}
                  cellRenderer={this._cellRenderer.bind(
                    null,
                    applianceHeaders,
                    applianceHeadersUnits
                  )}
                  columnCount={columnCount}
                  columnWidth={100}
                  fixedColumnCount={2}
                  fixedRowCount={2}
                  height={1200}
                  rowCount={rowCount}
                  rowHeight={this._rowHeight}
                  estimatedRowSize={26}
                  width={width}
                />
              )}
            </AutoSizer>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(ApplianceDataTable))
