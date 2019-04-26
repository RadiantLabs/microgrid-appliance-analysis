import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Grid, Header, Table } from 'semantic-ui-react'
import PredictedVsActual from '../../components/Charts/PredictedVsActual'
import { greyColors } from '../../utils/constants'

const headerStyle = { color: greyColors[1], fontWeight: '200', fontSize: '16px' }

class BatteryModel extends React.Component {
  render() {
    const { grid } = this.props
    if (!_.isEmpty(grid.fileImportErrors)) {
      return null
    }
    return (
      <div style={{ marginTop: '2rem' }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header as="h3" style={{ display: 'inline-block', marginBottom: '8px' }}>
                Battery Charge & Discharge Model
              </Header>
              <p style={headerStyle}>
                Recreate a simplified kinetic battery model based on the HOMER file.
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <PredictedVsActual
                data={grid.fileData}
                predicted="originalModeledBatteryEnergyContent"
                actual="originalBatteryEnergyContent"
              />
            </Grid.Column>
            <Grid.Column width={6}>
              <BatteryErrorTable />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryModel))

export const BatteryErrorTable = inject('store')(
  observer(({ store }) => {
    const { batteryAvgErrorPct, batteryMaxErrorPct } = store.viewedGrid
    return (
      <Table compact="very" size="small" basic="very" style={{ marginTop: '40px' }}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Battery Model Average Error</Table.Cell>
            <Table.Cell textAlign="right">
              {batteryAvgErrorPct ? `± ${batteryAvgErrorPct} %` : '...'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Battery Model Max Error</Table.Cell>
            <Table.Cell textAlign="right">
              {batteryMaxErrorPct ? `${batteryMaxErrorPct} %` : '...'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  })
)
