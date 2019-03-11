import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Input } from 'semantic-ui-react'
// import { Slider } from 'react-semantic-ui-range'
import _ from 'lodash'
import { isFloat, isInteger } from 'src/utils/helpers'
import { fieldDefinitions } from 'src/utils/fieldDefinitions'
import './InputField.css'

// Only save to mobx store once it's a valid value
class InputField extends React.Component {
  constructor(props) {
    super(props)
    const { fieldKey, modelInstance } = this.props
    if (_.isEmpty(modelInstance)) {
      throw new Error(`Must supply modelInstance to input field`)
    }
    if (_.isEmpty(modelInstance.onModelInputChange)) {
      throw new Error(`modelInstance must have an onModelInputChange as an action`)
    }
    if (_.isNil(fieldKey)) {
      throw new Error(`fieldKey is required`)
    }
    if (_.isNil(fieldDefinitions[fieldKey])) {
      throw new Error(`fieldKey passed in is not found in fieldDefinitions: ${fieldKey}`)
    }
    this.state = {
      value: modelInstance[fieldKey],
      error: '',
    }
  }

  // If entered value is valid on blur, update mobx state so calcs can run
  handleBlur = e => {
    const { value } = this.state
    const { fieldKey, modelInstance } = this.props
    const fieldDef = fieldDefinitions[fieldKey]
    const { onModelInputChange } = modelInstance
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
    const { fieldKey, modelInstance } = this.props
    const { value, error } = this.state
    const { units } = fieldDefinitions[fieldKey]
    return (
      <div className="InputFieldWrapper">
        <Input
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          error={Boolean(error)}
          size="small"
          fluid
          style={{ minWidth: '120px' }}
          label={unitLabelContent(units, modelInstance)}
          labelPosition={unitLabelPosition(units)}
        />
      </div>
    )
  }
}

export default inject('store')(observer(InputField))

//
// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
function unitLabelPosition(units) {
  if (!units) {
    return null
  }
  return units === '$' ? 'left' : 'right'
}

function unitLabelContent(units, modelInstance) {
  if (!units) {
    return null
  }
  const { productionUnitType } = modelInstance
  const content = _.includes(units, 'productionUnitType')
    ? _.replace(units, 'productionUnitType', productionUnitType || '-')
    : units
  return { basic: true, content }
}

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
