import { predictBatteryEnergyContent } from './predictBatteryEnergyContent'

// battery energy content and electricalProductionLoadDiff have the units of kWh
const baseBattery = {
  rowIndex: 10,
  batteryMinEnergyContent: 50,
  batteryMaxEnergyContent: 100,
  roundTripLosses: 0.01,
}

const middleBoundsCharging = {
  ...baseBattery,
  prevBatteryEnergyContent: 70,
  electricalProductionLoadDiff: 10,
}

const middleBoundsDischarging = {
  ...baseBattery,
  prevBatteryEnergyContent: 70,
  electricalProductionLoadDiff: -10,
}

const lowerClamping = {
  ...baseBattery,
  prevBatteryEnergyContent: 60,
  electricalProductionLoadDiff: -20,
}

const upperClamping = {
  ...baseBattery,
  prevBatteryEnergyContent: 90,
  electricalProductionLoadDiff: 20,
}

const atMin = {
  ...baseBattery,
  prevBatteryEnergyContent: baseBattery.batteryMinEnergyContent,
  electricalProductionLoadDiff: -10, // at bottom and still in load deficit
}

const atMax = {
  ...baseBattery,
  prevBatteryEnergyContent: baseBattery.batteryMaxEnergyContent,
  electricalProductionLoadDiff: 10, // at top and still has excess
}

describe('predicts battery energy content given previous content and difference between production and load', () => {
  test('should return an object with batteryEnergyContent', () => {
    expect(predictBatteryEnergyContent(middleBoundsCharging)).toHaveProperty('batteryEnergyContent')
    expect(predictBatteryEnergyContent(middleBoundsCharging)).toHaveProperty(
      'totalExcessProduction'
    )
    expect(predictBatteryEnergyContent(middleBoundsCharging)).toHaveProperty('totalUnmetLoad')
  })

  test('Middle of the battery capacity with no chance of hitting the min or max of battery, so clamping wont take effect', () => {
    expect(predictBatteryEnergyContent(middleBoundsCharging)).toStrictEqual({
      batteryEnergyContent: 79.2,
      totalExcessProduction: 0,
      totalUnmetLoad: 0,
    })
    expect(predictBatteryEnergyContent(middleBoundsDischarging)).toStrictEqual({
      batteryEnergyContent: 59.4,
      totalExcessProduction: 0,
      totalUnmetLoad: 0,
    })
  })

  // These are cases where we go from battery middle to clamped. Some of the
  // energy goes to the min or max of the batter, some goes to excess or unmet load.
  test('should clamp predicted based on min and max battery energy content', () => {
    expect(predictBatteryEnergyContent(lowerClamping)).toStrictEqual({
      batteryEnergyContent: baseBattery.batteryMinEnergyContent,
      totalExcessProduction: 0,
      totalUnmetLoad: 10,
    })
    expect(predictBatteryEnergyContent(upperClamping)).toStrictEqual({
      batteryEnergyContent: baseBattery.batteryMaxEnergyContent,
      totalExcessProduction: 10,
      totalUnmetLoad: 0,
    })
  })

  // This are cases where we have been at battery min or max for multiple hours,
  // so all of the extra energy goes into excess or unmet loads
  test('battery at its min, all load not met by production goes to totalUnmetLoad', () => {
    expect(predictBatteryEnergyContent(atMin)).toStrictEqual({
      batteryEnergyContent: baseBattery.batteryMinEnergyContent,
      totalExcessProduction: 0,
      totalUnmetLoad: Math.abs(atMin.electricalProductionLoadDiff), // expected 10, recieved 10.5
    })
  })

  test('battery at its max, all extra loads go to totalExcessProduction', () => {
    expect(predictBatteryEnergyContent(atMax)).toStrictEqual({
      batteryEnergyContent: baseBattery.batteryMaxEnergyContent,
      totalExcessProduction: atMax.electricalProductionLoadDiff, // expected 10, recieved 9
      totalUnmetLoad: 0,
    })
  })

  test('first hour of year should return prevBatteryEnergyContent', () => {
    const firstHour = {
      ...middleBoundsCharging,
      ...{ rowIndex: 0 },
    }
    expect(predictBatteryEnergyContent(firstHour)).toHaveProperty(
      'batteryEnergyContent',
      firstHour.prevBatteryEnergyContent
    )
  })
})
