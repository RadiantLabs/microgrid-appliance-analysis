import * as React from 'react'
import { observer, inject } from 'mobx-react'
import {
  Container,
  Grid,
  Header,
  Segment,
  Button,
  Icon,
  Loader,
  Message,
  Divider,
} from 'semantic-ui-react'

const Profile = () => (
  <Container>
    <h2>TODO</h2>
    <DeleteGrid />
  </Container>
)

export default inject('store')(observer(Profile))

const DeleteGrid = inject('store')(
  observer(({ store }) => {
    const { clearAppState } = store
    return (
      <Segment>
        <Header>Danger Zone</Header>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <p>
                You can choose to delete all files you've uploaded and start the app over in a fresh
                state. Clicking this button will delete all of the files you've updated and any
                edits you've made to this app. <strong>Deleting all data is not reversible.</strong>
              </p>{' '}
            </Grid.Column>
            <Grid.Column width={4}>
              <Button basic compact color="red" animated="fade" onClick={clearAppState}>
                <Button.Content visible>Delete All Data</Button.Content>
                <Button.Content hidden>Are you sure?</Button.Content>
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  })
)
