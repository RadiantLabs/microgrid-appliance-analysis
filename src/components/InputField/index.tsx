import * as React from 'react'
import { Input, Label } from 'semantic-ui-react'
import './InputField.css'

const InputField = () => {
  return (
    <div className="InputFieldWrapper">
      <Input labelPosition="right" type="text" placeholder="Amount" size="mini">
        <Label basic={true}>$</Label>
        <input />
        <Label>.00</Label>
      </Input>
    </div>
  )
}

export default InputField
