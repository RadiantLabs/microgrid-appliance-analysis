import * as React from 'react'
import { Component } from 'react'
import { Button } from 'semantic-ui-react'
import * as uuid from 'uuid'
import Papa from 'papaparse'

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

  // TODO:
  // * Check that the type is csv
  // * Check headers
  // * Limit size
  // * Capture name
  // * Call processHomerFile
  // const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }
  onChangeFile() {
    const fileButton = document.getElementById(this.id)
    const file = fileButton ? fileButton.files[0] : null
    console.log('file: ', file)
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results, a) => {
        console.log('results: ', results, a)
      },
      error: (a, b, c) => {
        console.log('error: ', a, b, c)
      },
    })
    // debugger
    if (this.props.onSelect) {
      this.props.onSelect(file)
    }
  }
}

export default FileButton
