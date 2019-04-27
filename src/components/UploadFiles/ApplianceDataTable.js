import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import { Grid } from 'semantic-ui-react'
import LoaderSpinner from '../../components/Elements/Loader'
import { setHeaderStyles } from '../../styles/tableStyles'
import { formatApplianceDateForTable } from '../../utils/helpers'

class ApplianceDataTable extends React.Component {
  _cellRenderer = (headers, units, { columnIndex, key, rowIndex, style }) => {
    const { calculatedApplianceColumns } = this.props.store.viewedAppliance
    const headerRowCount = 2 // column header name and units
    const columnHeader = headers[columnIndex]
    const columnUnit = units[columnIndex]

    // Column header name
    if (rowIndex === 0) {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'appliance')}>
          {columnHeader}
        </div>
      )
    }

    // Column header units
    if (rowIndex === 1) {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'appliance')}>
          {columnUnit || 'missing'}
        </div>
      )
    }

    // All other rows
    if (columnHeader === 'datetime') {
      return (
        <div key={key} style={setHeaderStyles(style, rowIndex, 'appliance')}>
          {formatApplianceDateForTable(
            calculatedApplianceColumns[rowIndex - headerRowCount][columnHeader]
          )}
        </div>
      )
    }
    return (
      <div key={key} style={setHeaderStyles(style, rowIndex, 'appliance')}>
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
    const applianceHeaderPairs = [
      ['datetime', '-'],
      ['dayOfWeek', '-'],
      ['dayHour', '-'],
      ['month', '-'],
      ['hour', '-'],
      ['hourOfDay', '-'],
      ['kwFactor', '-'],
      ['newApplianceLoad', 'kWh'],
      ['productionUnits', productionUnitType],
      ['productionUnitsRevenue', '$'],
    ]
    const applianceHeaders = _.map(applianceHeaderPairs, pair => pair[0])
    const applianceHeadersUnits = _.map(applianceHeaderPairs, pair => pair[1])
    const rowCount = _.size(calculatedApplianceColumns)
    const columnCount = _.size(applianceHeaders)
    return (
      <div style={{ height: '420px' }}>
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
                    height={400}
                    rowCount={rowCount}
                    rowHeight={this._rowHeight}
                    estimatedRowSize={26}
                    width={width}
                    style={{ border: '1px solid #d4d4d5' }}
                  />
                )}
              </AutoSizer>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(ApplianceDataTable))
