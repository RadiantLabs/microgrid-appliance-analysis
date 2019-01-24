import _ from 'lodash'

const rules = {
  power_converter: power_converters,
  inverter: inverter,
  vfd: vfd,
  soft_starter: soft_starter,
  direct_online_starter: direct_online_starter,
  star_delta_starter: star_delta_starter,
  capacitor_bank: capacitor_bank,
  three_four_point_dc_motor_starter: three_four_point_dc_motor_starter,
}

export function getAncillaryEquipmentOptions(homerFileInfo, applianceFileInfo, ancillaryEquipment) {
  checkEquipmentTypeRules(ancillaryEquipment, rules)
  const grid = homerFileInfo.attributes
  const appliance = applianceFileInfo.attributes
  const equipmentWithStatus = _.map(ancillaryEquipment, item => {
    const { status, message } = rules[item.equipmentType]({ grid, appliance })
    return { ...item, status, message }
  })
  // TODO: partition based on required, useful or notuseful
  // debugger
  return {
    required: [],
    useful: [],
    notuseful: [],
  }
}

/**
 * Functions called based on ancillary equipment we are testing
 */
function power_converters({ grid, appliance }) {
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
  const isRequired = appliance.powerType === 'DC' && grid.powerType === 'AC'
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

function soft_starter({ grid, appliance }) {
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

function direct_online_starter({ grid, appliance }) {
  const isUseful = appliance.hasMotor
  return {
    message: 'hi',
    status: isUseful ? 'useful' : 'notuseful',
  }
}

function star_delta_starter({ grid, appliance }) {
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

function capacitor_bank({ grid, appliance }) {
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

function three_four_point_dc_motor_starter({ grid, appliance }) {
  const isUseful = grid.powerType === 'DC' && appliance.powerType === 'DC'
  const message = isUseful
    ? 'A Three or Four Point Motor Starter may reduce starting current and improve power system voltage stability upon starting the appliance.'
    : 'A Three or Four Point Motor Starter may not be useful.'
  return {
    message,
    status: isUseful ? 'useful' : 'notuseful',
  }
}

/**
 * Check to make sure we have functions to handle every ancillary equipment type
 */
function checkEquipmentTypeRules(ancillaryEquipment, rules) {
  const equipmentTypes = _.uniq(_.map(ancillaryEquipment, 'equipmentType'))
  const ruleNames = _.keys(rules)
  _.forEach(equipmentTypes, type => {
    if (!_.includes(ruleNames, type)) {
      throw new Error(`Ancillary Equipment Rules: There is no rule for equipment type: ${type}`)
    }
  })
}
