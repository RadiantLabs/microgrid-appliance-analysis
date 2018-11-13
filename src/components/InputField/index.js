import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Form, Input, Label } from 'semantic-ui-react'
import _ from 'lodash'
import { isFloat, isInteger } from '../../utils/general'
// import { Slider } from 'react-semantic-ui-range'
import { fieldDefinitions } from '../../utils/fieldDefinitions'
import './InputField.css'

const checkValidity = (value, fieldDef) => {
  let error = false
  if (fieldDef.type === 'float') {
    error = isFloat(value) ? false : 'Field is not a float'
  }
  if (fieldDef.type === 'integer') {
    error = isInteger(value) ? false : 'Field is not an integer'
  }
  return error
}

// Only save to mobx store once it's a valid value
class InputField extends React.Component {
  constructor(props) {
    super(props)
    const { fieldKey } = this.props
    const { defaultValue } = fieldDefinitions[fieldKey]
    this.state = {
      value: defaultValue,
      error: '',
    }
  }

  // If entered value is valid on blur, update mobx state so calcs can run
  handleBlur = e => {
    const { value } = this.state
    const { fieldKey, store } = this.props
    const fieldDef = fieldDefinitions[fieldKey]
    const { onModelInputChange } = store
    const error = checkValidity(value, fieldDef)
    if (!error) {
      switch (fieldDef.type) {
        case 'integer':
          onModelInputChange(fieldKey, parseInt(value, 10))
          break
        case 'float':
          onModelInputChange(fieldKey, parseFloat(value))
          break
        default:
          onModelInputChange(fieldKey, value)
      }
    }
  }

  // Always update the component value, even if it's invalid so typing doesn't get stuck
  handleChange = (e, { value }) => {
    const { fieldKey } = this.props
    const fieldDef = fieldDefinitions[fieldKey]
    const error = checkValidity(value, fieldDef)
    this.setState({ value, error })
  }

  render() {
    const { fieldKey, store } = this.props
    const { value, error } = this.state
    if (_.isNil(fieldKey)) {
      return <Input disabled loading />
    }
    if (_.isNil(fieldDefinitions[fieldKey])) {
      throw new Error(
        `fieldKey passed in isn't found in fieldDefinitions: ${fieldKey}`
      )
    }

    return (
      <div>
        <div className="InputFieldWrapper">
          <Input
            value={value}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            error={Boolean(error)}
            // disabled
            // loading
            // label={{ basic: true, content: 'kg' }}
            // labelPosition="right"
          />
        </div>
      </div>
    )
  }
}

export default inject('store')(observer(InputField))

// <Form.Field
// // label={value}
// // value={value}
// control={Slider}
// color="grey"
// settings={{
//   start: value,
//   min: field.min,
//   max: field.max,
//   step: field.step || 1,
//   // onChange: this.handleChange,
// }}
// />

// <Input
//   labelPosition="right"
//   type="text"
//   placeholder="Amount"
//   size="mini">
//   <Label basic={true}>$</Label>
//   <input />
//   <Label>.00</Label>
// </Input>

/* <div className="InputFieldWrapper">
    <Form.Field
      label={value}
      control={Slider}
      color="grey"
      // style={{ backgroundColor: '#000' }}
      value={value}
      settings={{
        start: value,
        min: rangeSettings.min,
        max: rangeSettings.max,
        step: rangeSettings.step || 1,
        onChange: this.handleChange,
      }}
    />
  </div> */
