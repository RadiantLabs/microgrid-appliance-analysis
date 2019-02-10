import * as React from 'react'
import { Component } from 'react'
import { Button } from 'semantic-ui-react'
import * as uuid from 'uuid'

// <Loader active inline />
export class FileButton extends Component {
  constructor(props) {
    super(props)
    this.id = uuid.v1()
    this.onChangeFile = this.onChangeFile.bind(this)
  }

  render() {
    return (
      <div>
        <Button {...this.props} as="label" htmlFor={this.id} />
        <input hidden id={this.id} multiple type="file" onChange={this.onChangeFile} />
      </div>
    )
  }

  onChangeFile() {
    const fileButton = document.getElementById(this.id)
    const rawFile = fileButton.files[0]
    if (rawFile) {
      this.props.onSelect(rawFile)
    } else {
      console.log('no file found')
    }
  }
}

export default FileButton
