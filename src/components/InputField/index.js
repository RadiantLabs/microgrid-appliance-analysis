import * as React from 'react'
import { Form, Input, Label } from 'semantic-ui-react'
import { Slider } from 'react-semantic-ui-range'
import './InputField.css'

// const options1 = [
//   { key: 'm', text: 'Male', value: 'male' },
//   { key: 'f', text: 'Female', value: 'female' },
// ]

// const options2 = [
//   { key: '.com', text: '.com', value: '.com' },
//   { key: '.net', text: '.net', value: '.net' },
//   { key: '.org', text: '.org', value: '.org' },
// ]

const rangeSettings = {
  start: 2,
  min: 0,
  max: 10,
  step: 1,
}

class InputField extends React.Component {
  state = {
    value: 5,
  }

  // { name: string; value: string }
  // handleChange = (e: React.FormEvent<HTMLInputElement>) => {
  //   const { value } = e.currentTarget
  //   this.setState({
  //     value,
  //   })
  // }

  handleChange = value => {
    console.log('value: ', value)
    this.setState({
      value,
    })
  }

  render() {
    const { value } = this.state
    return (
      <div>
        <div className="InputFieldWrapper">
          <Form.Field
            label={value}
            control={Slider}
            // color="grey"
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
        </div>

        {/* <div className="InputFieldWrapper">
          <Slider
            discrete={true}
            color="red"
            inverted={false}
            settings={rangeSettings}
          />
        </div> */}

        <div className="InputFieldWrapper">
          <Input
            labelPosition="right"
            type="text"
            placeholder="Amount"
            size="mini">
            <Label basic={true}>$</Label>
            <input />
            <Label>.00</Label>
          </Input>
        </div>

        {/* <div className="InputFieldWrapper">
          <Form>
            <Form.Field inline={true}>
              <label>First name</label>
              <Input placeholder="First name" error={true} />
            </Form.Field>
          </Form>
        </div> */}

        {/* <div className="InputFieldWrapper">
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                fluid={true}
                label="First name"
                placeholder="First name"
                error={true}
              />
              <Form.Input
                fluid={true}
                label="Last name"
                placeholder="Last name"
              />
            </Form.Group>
            <Form.Select options={options1} placeholder="Gender" error={true} />
          </Form>
        </div> */}

        {/* <div className="InputFieldWrapper">
          <Form>
            <Input
              label={<Dropdown defaultValue=".com" options={options2} />}
              labelPosition="right"
              placeholder="Find domain"
              icon="at"
            />{' '}
          </Form>
        </div> */}
      </div>
    )
  }
}

export default InputField
