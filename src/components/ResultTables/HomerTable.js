import * as React from 'react'
// import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { AutoSizer, MultiGrid } from 'react-virtualized'
import LoaderSpinner from '../Elements/Loader'
import { Loader, Grid, Table } from 'semantic-ui-react'
import { setHeaderStyles } from './tableStyles'
import { greyColors } from '../../utils/constants'
import { formatDateForTable } from '../../utils/helpers'

class HomerTable extends React.Component {
  _cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { activeHomer } = this.props.store
    const keyOrder = _.keys(activeHomer[0])
    const headerStyle = setHeaderStyles(style, rowIndex, 'homer')
    const row = activeHomer[rowIndex]
    const val = row[keyOrder[columnIndex]]

    if (keyOrder[columnIndex] === 'Time') {
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
    return index === 0 ? 76 : 26
  }

  // This table only should update if the HOMER file updates. React Virtualized
  // aggressively caches and prevents updates even for some props changes
  componentDidUpdate(prevProps) {
    if (this.multigrid) {
      this.multigrid.forceUpdateGrids()
    }
  }

  render() {
    const { homerIsLoading, activeHomer, activeHomerFileInfo, homerStats } = this.props.store
    if (_.isEmpty(activeHomer)) {
      return <LoaderSpinner />
    }
    const columnCount = _.size(_.keys(activeHomer[0]))
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
          <Grid.Column floated="right" width={11}>
            <HomerStatsTable stats={homerStats} />
          </Grid.Column>
        </Grid>
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

const HomerStatsTable = ({ stats }) => {
  const {
    effectiveMinBatteryEnergyContent,
    maxBatteryEnergyContent,
    minBatteryEnergyContent,

    minBatteryStateOfCharge,
    maxBatteryStateOfCharge,
  } = stats
  return (
    <div>
      <Table
        basic="very"
        // selectable
        // celled
        collapsing
        // compact="very"
        size="small"
        style={{ float: 'right' }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <strong>Max Battery State of Charge</strong>
            </Table.Cell>
            <Table.Cell>{_.round(maxBatteryStateOfCharge, 4)} %</Table.Cell>

            <Table.Cell>
              <strong>Max Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(maxBatteryEnergyContent, 4)}</Table.Cell>

            <Table.Cell>
              <strong>Effective Min Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(effectiveMinBatteryEnergyContent, 4)}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <strong>Min Battery State of Charge</strong>
            </Table.Cell>
            <Table.Cell>{_.round(minBatteryStateOfCharge, 4)} %</Table.Cell>

            <Table.Cell>
              <strong>Min Battery Energy Content</strong>
            </Table.Cell>
            <Table.Cell>{_.round(minBatteryEnergyContent, 4)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}

export default inject('store')(observer(HomerTable))
