import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Container, Grid, Header, Segment, Button, Form } from 'semantic-ui-react'
import { logger } from '../../utils/logger'

class Profile extends Component {
  handleSubmit = () => {
    const { name, email } = this.state
    this.props.store.saveUserInfo(name, email)
  }

  render() {
    const { userName, userEmail, saveUserInfo, handleUserInfoChange } = this.props.store
    return (
      <Container>
        <Segment>
          <Header>User Profile</Header>
          <p>
            Fill out your name and email address. We track errors in the system and if there are
            errors we would like help reproducing, we may reach out to you.
          </p>
          <p>This is completely optional.</p>

          <Form onSubmit={saveUserInfo} autoComplete="off">
            <Form.Input
              name="userName"
              value={userName || ''}
              onChange={handleUserInfoChange}
              label="Name"
              placeholder="Name"
            />
            <Form.Input
              name="userEmail"
              value={userEmail || ''}
              onChange={handleUserInfoChange}
              label="Email"
              placeholder="Email"
            />
            <Form.Button basic color="blue" content="Save" />
          </Form>
        </Segment>

        <Button
          content="Throw Error"
          onClick={() => {
            logger('Error from button 2')
          }}
        />

        <DeleteGrid />
      </Container>
    )
  }
}

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
                state.
              </p>
              <p>
                Clicking this button will delete all of the files you've updated and any edits
                you've made to this app. Username and email will not be deleted but you can delete
                those above.
              </p>
              <p>
                <strong>Deleting all data is not reversible.</strong>
              </p>
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
