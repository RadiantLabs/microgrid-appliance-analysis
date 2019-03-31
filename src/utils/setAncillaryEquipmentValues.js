// import _ from 'lodash'

// Ancillary Equipment Rules based on
// https://docs.google.com/spreadsheets/d/1DH7CaK4894MkHnTFlH1M9p7qmcHtqufdzLO8x-SXO8s/edit#gid=748448415
export function setAncillaryEquipmentValues({
  equipmentType,
  gridPowerType,
  appliancePowerType,
  applianceHasMotor,
  appliancePhase,
  appliancePowerFactor,
  ancillaryEquipmentList,
}) {
  if (!equipmentType || !gridPowerType || !appliancePowerType) {
    return {}
  }
  switch (equipmentType) {
    case 'powerConverter':
      return powerConverter(gridPowerType, appliancePowerType)
    case 'inverter':
      return inverter(gridPowerType, appliancePowerType)
    case 'vfd':
      return vfd(gridPowerType, appliancePowerType, applianceHasMotor, appliancePhase)
    case 'softStarter':
      return softStarter(gridPowerType, appliancePowerType, applianceHasMotor)
    case 'directOnlineStarter':
      return directOnlineStarter(applianceHasMotor)
    case 'starDeltaStarter':
      return starDeltaStarter(gridPowerType, appliancePowerType, applianceHasMotor, appliancePhase)
    case 'capacitorBank':
      return capacitorBank(gridPowerType, appliancePowerType, appliancePowerFactor)
    case 'threeFourPointDcMotorStarter':
      return threeFourPointDcMotorStarter(gridPowerType, appliancePowerType)
    default:
      throw new Error(
        `Ancillary Equipment Rules: There is no rule for equipment type: ${equipmentType}`
      )
  }
}

//------------------------------------------------------------------------------
// Functions called based on ancillary equipment we are testing
//------------------------------------------------------------------------------
function powerConverter(gridPowerType, appliancePowerType) {
  const isRequired = appliancePowerType === 'DC' && gridPowerType === 'AC'
  const message = isRequired
    ? 'A power converter is required hardware for successful appliance operation.'
    : 'A power converter may not be useful. A power converter may be useful if the supply power is AC and the appliance is designed to receive DC power.'
  return {
    compatibility: isRequired ? 'required' : 'notuseful',
    compatibilityMessage: message,
  }
}

function inverter(gridPowerType, appliancePowerType) {
  const isRequired = appliancePowerType === 'AC' && gridPowerType === 'DC'
  const message = isRequired
    ? 'An inverter is required hardware for successful appliance operation.'
    : 'An inverter may not be useful. An inverter may be useful if the supply power is DC and the appliance is designed to receive AC power.'
  return {
    compatibility: isRequired ? 'required' : 'notuseful',
    compatibilityMessage: message,
  }
}

function vfd(gridPowerType, appliancePowerType, applianceHasMotor, appliancePhase) {
  const isUseful =
    gridPowerType === 'AC' && //
    appliancePowerType === 'AC' && //
    applianceHasMotor && //
    appliancePhase === 3
  const message = isUseful
    ? 'A variable frequency drive may be useful to reduce in-rush current and provide speed control.'
    : 'A variable frequency drive may not be useful or available for this appliance. VFDs are most common for three phase AC motor applications to reduce in-rush current and motor speed control.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}

function softStarter(gridPowerType, appliancePowerType, applianceHasMotor) {
  const isUseful =
    gridPowerType === 'AC' && //
    appliancePowerType === 'AC' && //
    applianceHasMotor
  const message = isUseful
    ? 'A soft starter may be useful to reduce in-rush current and starting torque and to provide motor protection.'
    : 'A soft starter may not be useful for this appliance. Soft starters may be useful for AC motor applications to reduce in-rush current and starting torque.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}

function directOnlineStarter(applianceHasMotor) {
  const isUseful = applianceHasMotor
  const message = isUseful
    ? 'A direct on-line starter may be useful to start a motor and provide overloading and short-circuit protection.'
    : 'A direct on-line starter may not be useful for appliances without motors.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}

function starDeltaStarter(gridPowerType, appliancePowerType, applianceHasMotor, appliancePhase) {
  const isUseful =
    gridPowerType === 'AC' && //
    appliancePowerType === 'AC' && //
    applianceHasMotor && //
    appliancePhase === 3
  const message = isUseful
    ? 'A star delta starter may be useful to reduce in-rush current and starting torque.'
    : 'A star delta starter may not be useful or available for this appliance. Star Delta Starters are most common for three phase AC motor applications to reduce in-rush current and starting torque.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}

function capacitorBank(gridPowerType, appliancePowerType, appliancePowerFactor) {
  const isUseful =
    gridPowerType === 'AC' && //
    appliancePowerType === 'AC' && //
    appliancePowerFactor < 0.9
  const message = isUseful
    ? 'An appropriately sized capacitor bank may raise power factor of the appliance.'
    : 'A capacitor bank may not be useful.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}

function threeFourPointDcMotorStarter(gridPowerType, appliancePowerType) {
  const isUseful = gridPowerType === 'DC' && appliancePowerType === 'DC'
  const message = isUseful
    ? 'A Three or Four Point Motor Starter may reduce starting current and improve power system voltage stability upon starting the appliance.'
    : 'A Three or Four Point Motor Starter may not be useful.'
  return {
    compatibility: isUseful ? 'useful' : 'notuseful',
    compatibilityMessage: message,
  }
}
