import * as React from 'react'
import _ from 'lodash'
import { Grid, Header, Card, Icon } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react'
// import borderlessTableStyles from '../../../styles/borderlessTableStyles.module.css'

export const GridDiagram = inject('store')(
  observer(({ store }) => {
    const { enabledAppliances } = store
    return (
      <Grid celled>
        <Grid.Row>
          <Grid.Column width={6}>
            <Header>Active Grid</Header>
          </Grid.Column>
          <Grid.Column width={5}>
            <Header>Enabled Appliances</Header>
          </Grid.Column>
          <Grid.Column width={5}>
            <Header>Enabled Ancillary Equipment</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={6}>Put active grid card here</Grid.Column>
          <Grid.Column width={10}>
            {_.map(enabledAppliances, appliance => {
              return <ApplianceGrid key={appliance.fileInfo.id} appliance={appliance} />
            })}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  })
)

const ApplianceGrid = inject('store')(
  observer(({ store, appliance }) => {
    return (
      <Grid celled>
        <Grid.Row>
          <Grid.Column width={8}>{appliance.label}</Grid.Column>
          <Grid.Column width={8}>
            <AncillaryEquipmentCards appliance={appliance} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  })
)

const AncillaryEquipmentCards = inject('store')(
  observer(({ store, appliance }) => {
    return (
      <div>
        {_.map(appliance.enabledAncillaryEquipment, equip => {
          return (
            <Card key={equip.label}>
              <Card.Content header={equip.label} />
              <Card.Content description="description" />
              <Card.Content extra>
                <Icon name="user" />4 Friends
              </Card.Content>
            </Card>
          )
        })}
      </div>
    )
  })
)
