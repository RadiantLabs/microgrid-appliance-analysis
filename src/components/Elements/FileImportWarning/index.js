import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Modal, Button, Segment, Header, Divider } from 'semantic-ui-react'

export const FileImportWarning = inject('store')(
  observer(({ store }) => {
    const { fileImportWarningIsActive, closeFileImportWarningModal, clearAppState } = store
    return (
      <Modal open={fileImportWarningIsActive}>
        <Modal.Header>Unable to Upload File</Modal.Header>
        <Modal.Content>
          <p>
            This is most likely due to your browser ran out of room to store files. If that's the
            case, you'll need to delete other files to make room.
          </p>
          <p>
            Unfortunately, the browser doesn't give us a reason for this error. And every browser
            has different storage limits, so we can't warn you when you are getting close to the
            limit.
          </p>
          <p>
            The file you tried to upload was not saved. Close this window and delete unused HOMER or
            Appliance files and try again. Sorry for the inconvenience.
          </p>
          <p>
            <Button basic compact color="blue" onClick={closeFileImportWarningModal}>
              Go Back And Delete Other Files
            </Button>
          </p>
          <Divider />
          <Segment>
            <Header>Danger Zone</Header>
            <p>
              You can choose to delete all files you've uploaded and start the app over in a fresh
              state. Clicking this button will delete all of the files you've updated and any edits
              you've made to this app. <strong>Deleting all data is not reversible.</strong>
            </p>
            <Button basic compact color="red" animated="fade" onClick={clearAppState}>
              <Button.Content visible>Delete All Data</Button.Content>
              <Button.Content hidden>Are you sure?</Button.Content>
            </Button>
          </Segment>
        </Modal.Content>
      </Modal>
    )
  })
)
