import _ from 'lodash'
import { logger } from '../utils/logger'

// Ancillary Equipment Rules based on
// https://docs.google.com/spreadsheets/d/1DH7CaK4894MkHnTFlH1M9p7qmcHtqufdzLO8x-SXO8s/edit#gid=748448415
export function setAncillaryEquipmentValues({
  equipmentType,
  gridPowerType,
  applPowerType,
  applHasMotor,
  applPhase,
  applPowerFactor,
  applSize,
  ancillaryEquipmentList,
}) {
  if (!equipmentType || !gridPowerType || !applPowerType) {
    return {}
  }
  switch (equipmentType) {
    case 'powerConverter':
      return powerConverter(gridPowerType, applPowerType, applSize)
    case 'inverter':
      return inverter(gridPowerType, applPowerType, applSize)
    case 'vfd':
      return vfd(gridPowerType, applPowerType, applHasMotor, applPhase, applSize)
    case 'softStarter':
      return softStarter(gridPowerType, applPowerType, applHasMotor, applSize)
    case 'directOnlineStarter':
      return directOnlineStarter(applHasMotor, applSize)
    case 'starDeltaStarter':
      return starDeltaStarter(gridPowerType, applPowerType, applHasMotor, applPhase, applSize)
    case 'capacitorBank':
      return capacitorBank(gridPowerType, applPowerType, applPowerFactor, applSize)
    case 'threeFourPointDcMotorStarter':
      return threeFourPointDcMotorStarter(gridPowerType, applPowerType, applSize)
    default:
      logger(`Ancillary Equipment Rules: There is no rule for equipment type: ${equipmentType}`)
  }
}

//------------------------------------------------------------------------------
// Functions called based on ancillary equipment we are testing
//------------------------------------------------------------------------------
function powerConverter(gridPowerType, applPowerType, applSize) {
  const isRequired = applPowerType === 'DC' && gridPowerType === 'AC'
  const message = isRequired
    ? 'A power converter is required hardware for successful appliance operation.'
    : 'A power converter may not be useful. A power converter may be useful if the supply power is AC and the appliance is designed to receive DC power.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isRequired ? 'required' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: powerConverterPrice(equipmentSize),
    estimatedEfficiency: powerConverterEfficiency(equipmentSize),
  }
}

function inverter(gridPowerType, applPowerType, applSize) {
  const isRequired = applPowerType === 'AC' && gridPowerType === 'DC'
  const message = isRequired
    ? 'An inverter is required hardware for successful appliance operation.'
    : 'An inverter may not be useful. An inverter may be useful if the supply power is DC and the appliance is designed to receive AC power.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isRequired ? 'required' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: inverterPrice(equipmentSize),
    estimatedEfficiency: inverterEfficiency(equipmentSize),
  }
}

function vfd(gridPowerType, applPowerType, applHasMotor, applPhase, applSize) {
  const isUseful =
    gridPowerType === 'AC' && //
    applPowerType === 'AC' && //
    applHasMotor && //
    applPhase === 3
  const message = isUseful
    ? 'A variable frequency drive may be useful to reduce in-rush current and provide speed control.'
    : 'A variable frequency drive may not be useful or available for this appliance. VFDs are most common for three phase AC motor applications to reduce in-rush current and motor speed control.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: vfdPrice(equipmentSize),
    estimatedEfficiency: vfdEfficiency(equipmentSize),
  }
}

function softStarter(gridPowerType, applPowerType, applHasMotor, applSize) {
  const isUseful =
    gridPowerType === 'AC' && //
    applPowerType === 'AC' && //
    applHasMotor
  const message = isUseful
    ? 'A soft starter may be useful to reduce in-rush current and starting torque and to provide motor protection.'
    : 'A soft starter may not be useful for this appliance. Soft starters may be useful for AC motor applications to reduce in-rush current and starting torque.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: softStarterPrice(equipmentSize),
    estimatedEfficiency: softStarterEfficiency(equipmentSize),
  }
}

function directOnlineStarter(applHasMotor, applSize) {
  const isUseful = applHasMotor
  const message = isUseful
    ? 'A direct on-line starter may be useful to start a motor and provide overloading and short-circuit protection.'
    : 'A direct on-line starter may not be useful for appliances without motors.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: directOnlineStarterPrice(equipmentSize),
    estimatedEfficiency: directOnlineStarterEfficiency(equipmentSize),
  }
}

function starDeltaStarter(gridPowerType, applPowerType, applHasMotor, applPhase, applSize) {
  const isUseful =
    gridPowerType === 'AC' && //
    applPowerType === 'AC' && //
    applHasMotor && //
    applPhase === 3
  const message = isUseful
    ? 'A star delta starter may be useful to reduce in-rush current and starting torque.'
    : 'A star delta starter may not be useful or available for this appliance. Star Delta Starters are most common for three phase AC motor applications to reduce in-rush current and starting torque.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: starDeltaStarterPrice(equipmentSize),
    estimatedEfficiency: starDeltaStarterEfficiency(equipmentSize),
  }
}

function capacitorBank(gridPowerType, applPowerType, applPowerFactor, applSize) {
  const isUseful =
    gridPowerType === 'AC' && //
    applPowerType === 'AC' && //
    applPowerFactor < 0.9
  const message = isUseful
    ? 'An appropriately sized capacitor bank may raise power factor of the appliance.'
    : 'A capacitor bank may not be useful.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: capacitorBankPrice(equipmentSize),
    estimatedEfficiency: capacitorBankEfficiency(equipmentSize),
  }
}

function threeFourPointDcMotorStarter(gridPowerType, applPowerType, applSize) {
  const isUseful = gridPowerType === 'DC' && applPowerType === 'DC'
  const message = isUseful
    ? 'A Three or Four Point Motor Starter may reduce starting current and improve power system voltage stability upon starting the appliance.'
    : 'A Three or Four Point Motor Starter may not be useful.'
  const equipmentSize = _.ceil(applSize, 1)
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
    equipmentSize,
    estimatedCapex: threeFourPointDcMotorStarterPrice(equipmentSize),
    estimatedEfficiency: threeFourPointDcMotorStarterEfficiency(equipmentSize),
  }
}

//------------------------------------------------------------------------------
// Estimate equipment cost and efficiency based on size (in kW)
//------------------------------------------------------------------------------
const powerConverterPrice = x =>
  _.round(66.156 * Math.pow(x, 3) - 560.06 * Math.pow(x, 2) + 1588.3 * x - 1080.6)

const powerConverterEfficiency = x => {
  switch (true) {
    case x >= 5:
      return 0.89
    case x >= 3:
      return 0.9
    case x >= 2:
      return 0.905
    case x >= 1.5:
      return 0.87
    default:
      return 0.87
  }
}

const inverterPrice = x =>
  _.round(1.5623 * Math.pow(x, 3) - 48.062 * Math.pow(x, 2) + 409.07 * x + 15.42)

const inverterEfficiency = x => {
  switch (true) {
    case x > 0.35:
      return 0.975
    default:
      return 0.96
  }
}

const vfdPrice = x =>
  _.round(-0.0497 * Math.pow(x, 3) + 2.6451 * Math.pow(x, 2) + 70.373 * x + 547.77)

const vfdEfficiency = x => 0.965

const softStarterPrice = x =>
  _.round(3.4533 * Math.pow(x, 3) - 40.075 * Math.pow(x, 2) + 166.22 * x + 148.25)

const softStarterEfficiency = x => 0.99

const directOnlineStarterPrice = x =>
  _.round(0.8516 * Math.pow(x, 3) - 9.5437 * Math.pow(x, 2) + 37.417 * x + 75.889)

const directOnlineStarterEfficiency = x => 1

const starDeltaStarterPrice = x =>
  _.round(8.3978 * Math.pow(x, 3) - 96.274 * Math.pow(x, 2) + 347.15 * x - 130.59)

const starDeltaStarterEfficiency = x => 1

const capacitorBankPrice = x =>
  _.round(-0.505 * Math.pow(x, 3) + 6.7948 * Math.pow(x, 2) + 14.093 * x + 266.85)

const capacitorBankEfficiency = x => 1

const threeFourPointDcMotorStarterPrice = x => 0
const threeFourPointDcMotorStarterEfficiency = x => 1
