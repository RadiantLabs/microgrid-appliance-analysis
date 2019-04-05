import * as React from 'react'
import _ from 'lodash'
import { Grid, Button, Divider } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
import { GridCard, ApplianceCard, AncillaryEquipmentCard } from './ComponentCards'
import LoaderSpinner from '../../../components/Elements/Loader'

class GridComponents extends React.Component {
  state = { expanded: false }

  handleExpandedClick = (value, e) => {
    e.preventDefault()
    this.setState({ expanded: value })
  }

  render() {
    const { combinedTable, enabledAppliances, activeGrid } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { expanded } = this.state
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Button.Group basic compact style={{ float: 'right' }}>
              <Button
                onClick={this.handleExpandedClick.bind(null, false)}
                active={expanded === false}>
                Compact
              </Button>
              <Button
                onClick={this.handleExpandedClick.bind(null, true)}
                active={expanded === true}>
                Expanded
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={6}>
            <GridCard grid={activeGrid} expanded={expanded} />
          </Grid.Column>

          <Grid.Column width={10}>
            {_.map(enabledAppliances, (appliance, applianceIndex) => {
              return (
                <ApplianceGrid
                  key={appliance.fileInfo.id}
                  appliance={appliance}
                  applianceIndex={applianceIndex}
                  expanded={expanded}
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
  observer(({ store, appliance, applianceIndex, expanded }) => {
    return (
      <div>
        <Divider horizontal>Enabled Appliance {applianceIndex + 1} & Ancillary Equipment</Divider>
        <Grid style={{ marginBottom: '30px' }}>
          <Grid.Row>
            <Grid.Column width={8}>
              <ApplianceCard appliance={appliance} expanded={expanded} />
            </Grid.Column>
            <Grid.Column width={8}>
              {_.map(appliance.enabledAncillaryEquipment, equipment => {
                return (
                  <AncillaryEquipmentCard
                    equipment={equipment}
                    key={equipment.label}
                    expanded={expanded}
                  />
                )
              })}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  })
)
