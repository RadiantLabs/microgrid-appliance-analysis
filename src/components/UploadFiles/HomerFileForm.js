import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import FileButton from 'components/Elements/FileButton'
// import { HelperPopup } from 'components/Elements/HelperPopup'

class HomerFileForm extends React.Component {
  state = {
    fileStaged: false,
  }

  render() {
    const { fileStaged } = this.state
    const { onHomerFileUpload } = this.props.store.grid
    return (
      <div>
        <Header as="h2" attached="top">
          <FileButton
            content="Upload & Analyze HOMER File"
            icon="upload"
            size="small"
            color="blue"
            floated="right"
            onSelect={onHomerFileUpload}
            basic
          />
          Add HOMER File
          {/*<HelperPopup content={'TODO'} position="right center" style={{ color: 'red' }} />*/}
        </Header>
        {fileStaged && <Segment attached>wat</Segment>}
      </div>
    )
  }
}

export default inject('store')(observer(HomerFileForm))
