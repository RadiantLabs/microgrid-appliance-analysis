import * as React from 'react'
import _ from 'lodash'
import { Grid, Button, Divider } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { GridCard, ApplianceCard, AncillaryEquipmentCard } from './ComponentCards'
import LoaderSpinner from '../../../components/Elements/Loader'

class GridComponents extends React.Component {
  render() {
    const { combinedTable, enabledAppliances, activeGrid, handleCardExpansion } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Button.Group basic compact style={{ float: 'right' }}>
              <Button onClick={handleCardExpansion.bind(null, false)}>Compact All</Button>
              <Button onClick={handleCardExpansion.bind(null, true)}>Expanded All</Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={6}>
            <GridCard grid={activeGrid} />
          </Grid.Column>
          <Grid.Column width={10}>
            {_.map(enabledAppliances, (appliance, applianceIndex) => {
              return (
                <ApplianceGrid
                  key={appliance.fileInfo.id}
                  appliance={appliance}
                  applianceIndex={applianceIndex}
                />
              )
            })}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(GridComponents))

const ApplianceGrid = inject('store')(
  observer(({ store, appliance, applianceIndex }) => {
    return (
      <div>
        <Divider horizontal>Enabled Appliance {applianceIndex + 1} & Ancillary Equipment</Divider>
        <Grid style={{ marginBottom: '30px' }}>
          <Grid.Row>
            <Grid.Column width={8}>
              <ApplianceCard appliance={appliance} />
            </Grid.Column>
            <Grid.Column width={8}>
              {_.map(appliance.enabledAncillaryEquipment, equipment => {
                return <AncillaryEquipmentCard equipment={equipment} key={equipment.label} />
              })}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  })
)
