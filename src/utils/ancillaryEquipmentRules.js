import React from 'react'
import _ from 'lodash'
import { ReactComponent as PowerConverterSVG } from '../images/ac_to_dc_power_converter.svg'
import { ReactComponent as InverterSVG } from '../images/dc_to_ac_inverter.svg'
import { ReactComponent as PlaceholderSVG } from '../images/placeholder.svg'

export function getEquipmentDiagram(equipmentType) {
  switch (equipmentType) {
    case 'powerConverter':
      return <PowerConverterSVG />
    case 'inverter':
      return <InverterSVG />
    default:
      return <PlaceholderSVG />
  }
}

export function getAncillaryEquipmentStatus(grid, appliance, ancillaryEquipmentList) {
  if (_.isEmpty(grid) || _.isEmpty(appliance) || _.isEmpty(ancillaryEquipmentList)) {
    return {}
  }
  // This is verbose but clearer than the opaque meta-programming approach I had before
  const equipmentWithStatus = _.map(ancillaryEquipmentList, item => {
    switch (item.equipmentType) {
      case 'powerConverter':
        return { ...item, ...powerConverter({ grid, appliance }) }
      case 'inverter':
        return { ...item, ...inverter({ grid, appliance }) }
      case 'vfd':
        return { ...item, ...vfd({ grid, appliance }) }
      case 'softStarter':
        return { ...item, ...softStarter({ grid, appliance }) }
      case 'directOnlineStarter':
        return { ...item, ...directOnlineStarter({ grid, appliance }) }
      case 'starDeltaStarter':
        return { ...item, ...starDeltaStarter({ grid, appliance }) }
      case 'capacitorBank':
        return { ...item, ...capacitorBank({ grid, appliance }) }
      case 'threeFourPointDcMotorStarter':
        return { ...item, ...threeFourPointDcMotorStarter({ grid, appliance }) }
      default:
        throw new Error(
          `Ancillary Equipment Rules: There is no rule for equipment type: ${item.equipmentType}`
        )
    }
  })
  const [required, leftover] = _.partition(equipmentWithStatus, { status: 'required' })
  const [useful, notuseful] = _.partition(leftover, { status: 'useful' })
  return { required, useful, notuseful }
}

export function disableAllAncillaryEquipment(ancillaryEquipment) {
  return _.reduce(
    ancillaryEquipment,
    (result, item) => {
      result[item['equipmentType']] = false
      return result
    },
    {}
  )
}

export function setAncillaryEquipmentEnabledFromStatus(equipmentStatus, enabledStates) {
  const requiredEquipmentTypes = _.map(equipmentStatus['required'], 'equipmentType')
  const clonedEnabled = _.cloneDeep(enabledStates)
  return _.reduce(
    requiredEquipmentTypes,
    (result, equipmentType) => {
      result[equipmentType] = true
      return result
    },
    clonedEnabled
  )
}

/**
 * Functions called based on ancillary equipment we are testing
 */
function powerConverter({ grid, appliance }) {
  const isRequired = appliance.powerType === 'DC' && grid.powerType === 'AC'
  const message = isRequired
    ? 'A power converter is required hardware for successful appliance operation.'
    : 'A power converter may not be useful. A power converter may be useful if the supply power is AC and the appliance is designed to receive DC power.'
  return {
    message,
    status: isRequired ? 'required' : 'notuseful',
  }
}

function inverter({ grid, appliance }) {
  const isRequired = appliance.powerType === 'AC' && grid.powerType === 'DC'
  const message = isRequired
    ? 'An inverter is required hardware for successful appliance operation.'
    : 'An inverter may not be useful. An inverter may be useful if the supply power is DC and the appliance is designed to receive AC power.'
  return {
    message,
    status: isRequired ? 'required' : 'notuseful',
  }
}

function vfd({ grid, appliance }) {
  const isUseful =
    grid.powerType === 'AC' && //
    appliance.powerType === 'AC' && //
    appliance.hasMotor && //
    appliance.phase === 3
  const message = isUseful
    ? 'A variable frequency drive may be useful to reduce in-rush current and provide speed control.'
    : 'A variable frequency drive may not be useful or available for this appliance. VFDs are most common for three phase AC motor applications to reduce in-rush current and motor speed control.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function softStarter({ grid, appliance }) {
  const isUseful =
    grid.powerType === 'AC' && //
    appliance.powerType === 'AC' && //
    appliance.hasMotor
  const message = isUseful
    ? 'A soft starter may be useful to reduce in-rush current and starting torque and to provide motor protection.'
    : 'A soft starter may not be useful for this appliance. Soft starters may be useful for AC motor applications to reduce in-rush current and starting torque.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function directOnlineStarter({ grid, appliance }) {
  const isUseful = appliance.hasMotor
  const message = isUseful
    ? 'A direct on-line starter may be useful to start a motor and provide overloading and short-circuit protection.'
    : 'A direct on-line starter may not be useful for appliances without motors.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function starDeltaStarter({ grid, appliance }) {
  const isUseful =
    grid.powerType === 'AC' && //
    appliance.powerType === 'AC' && //
    appliance.hasMotor && //
    appliance.phase === 3
  const message = isUseful
    ? 'A star delta starter may be useful to reduce in-rush current and starting torque.'
    : 'A star delta starter may not be useful or available for this appliance. Star Delta Starters are most common for three phase AC motor applications to reduce in-rush current and starting torque.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function capacitorBank({ grid, appliance }) {
  const isUseful =
    grid.powerType === 'AC' && //
    appliance.powerType === 'AC' && //
    appliance.powerFactor < 0.9
  const message = isUseful
    ? 'An appropriately sized capacitor bank may raise power factor of the appliance.'
    : 'A capacitor bank may not be useful.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function threeFourPointDcMotorStarter({ grid, appliance }) {
  const isUseful = grid.powerType === 'DC' && appliance.powerType === 'DC'
  const message = isUseful
    ? 'A Three or Four Point Motor Starter may reduce starting current and improve power system voltage stability upon starting the appliance.'
    : 'A Three or Four Point Motor Starter may not be useful.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}
