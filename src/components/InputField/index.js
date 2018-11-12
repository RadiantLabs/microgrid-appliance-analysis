import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Form, Input, Label } from 'semantic-ui-react'
import _ from 'lodash'
// import { Slider } from 'react-semantic-ui-range'
import { fieldDefinitions } from '../../utils/fieldDefinitions'
import './InputField.css'

class InputField extends React.Component {
  // state = {
  //   value: 1,
  // }

  // TODO: Pull initial state from fieldDefinitions?

  // TODO: only save to mobx store once it's a valid value
  // handleChange = value => {
  //   console.log('value: ', value)
  //   this.setState({
  //     value,
  //   })
  // }

  render() {
    const { fieldKey, store } = this.props
    if (_.isNil(fieldKey)) {
      return <Input disabled loading />
    }
    const { modelInputs, onModelInputChange } = store
    return (
      <div>
        <div className="InputFieldWrapper">
          <Input
            value={modelInputs[fieldKey].value}
            onChange={onModelInputChange.bind(fieldKey)}
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
