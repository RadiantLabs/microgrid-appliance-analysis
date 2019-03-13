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
    if (_.has(modelInstance[fieldKey])) {
      throw new Error(`fieldKey passed in is not found in model instance: ${fieldKey}`)
    }
    if (_.has(modelInstance[`${fieldKey}Temp`])) {
      throw new Error(`${fieldKey}Temp passed in is not found in model instance: ${fieldKey}Temp`)
    }
    if (_.has(modelInstance[`${fieldKey}Error`])) {
      throw new Error(`${fieldKey}Error passed in is not found in model instance: ${fieldKey}Error`)
    }
  }

  // If entered value is valid on blur, update mobx state so calcs can run
  handleBlur = e => {
    const { fieldKey, modelInstance } = this.props
    const { onModelInputBlur, modelInputValues } = modelInstance
    const value = modelInputValues[fieldKey]
    const fieldDef = fieldDefinitions[fieldKey]
    const error = checkValidity(value, fieldDef)
    switch (fieldDef.type) {
      case 'integer':
        onModelInputBlur(fieldKey, parseInt(value, 10), error)
        break
      case 'float':
        onModelInputBlur(fieldKey, parseFloat(value), error)
        break
      default:
        onModelInputBlur(fieldKey, value, error)
    }
  }

  // Always update the component value, even if it's invalid so typing doesn't get stuck
  handleChange = (e, { value }) => {
    const { fieldKey } = this.props
    const fieldDef = fieldDefinitions[fieldKey]
    const error = checkValidity(value, fieldDef)
    this.props.modelInstance.onModelInputChange(fieldKey, value, error)
  }

  render() {
    const { fieldKey, modelInstance } = this.props
    const { modelInputValues, modelInputErrors } = modelInstance
    const { units } = fieldDefinitions[fieldKey]
    const value = modelInputValues[fieldKey] === 0 ? 0 : modelInputValues[fieldKey] || ''
    console.log('value: ', value)
    return (
      <div className="InputFieldWrapper">
        <Input
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          error={Boolean(modelInputErrors[fieldKey])}
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
