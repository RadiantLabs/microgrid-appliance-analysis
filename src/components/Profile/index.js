import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Container, Grid, Header, Segment, Button, Form, Transition } from 'semantic-ui-react'
import { logger } from '../../utils/logger'

class Profile extends Component {
  state = { visible: false }

  handleSubmit = () => {
    const { name, email } = this.state
    this.props.store.saveUserInfo(name, email)
  }

  toggleDebugVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible } = this.state
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

        <RefreshApp />
        <DeleteStoredData />

        <Segment>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Header as="h5">Debugging</Header>
                <p>Only use this section if asked to by developers who are debugging the app.</p>
              </Grid.Column>
              <Grid.Column width={4}>
                <Button
                  basic
                  content={visible ? 'Hide Debug Info' : 'Show Debug Info'}
                  onClick={this.toggleDebugVisibility}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <Transition visible={visible} animation="scale" duration={100}>
                  <Button
                    content="Send Test Error"
                    basic
                    onClick={() => {
                      logger('Error from Throw Test Error Button')
                    }}
                  />
                </Transition>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Container>
    )
  }
}

export default inject('store')(observer(Profile))

const RefreshApp = inject('store')(
  observer(({ store }) => {
    const { refreshApp } = store
    return (
      <Segment>
        <Header>Danger Zone</Header>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <p>
                Refresh the app. This may be useful if there are problems or to see app updates. Any
                unsaved changes will be lost.
              </p>
            </Grid.Column>
            <Grid.Column width={4}>
              <Button basic compact color="blue" onClick={refreshApp}>
                Refresh App
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  })
)

const DeleteStoredData = inject('store')(
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
