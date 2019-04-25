import _ from 'lodash'
import { logger } from '../utils/logger'

export function getGridPowerType(headers) {
  const hasDC = _.some(headers, header => _.includes(header, 'DC Primary Load'))
  const hasAC = _.some(headers, header => _.includes(header, 'AC Primary Load'))
  if (hasDC && hasAC) {
    logger(`Detecting both AC and DC Loads`)
  }
  if (!hasDC && !hasAC) {
    logger(`Detecting neither AC nor DC Loads`)
  }
  return {
    powerType: hasDC ? 'DC' : 'AC',
    powerTypeErrors:
      hasDC && hasAC
        ? "This grid appears to have both AC and DC power types, which we don't currently support. Please contact support."
        : null,
  }
}

export function getPvType(headers) {
  const pvColumn = 'Angle of Incidence'
  const header = _.find(headers, header => _.includes(header, pvColumn))
  const pvType = _.trim(header.split(pvColumn)[0])
  return {
    pvType,
    pvTypeErrors: _.isString(pvType)
      ? null
      : `Cannot determine PV type. Looking for a column called '___ ${pvColumn}'`,
  }
}

export function getBatteryType(headers) {
  const batteryColumn = 'State of Charge'
  const header = _.find(headers, header => _.includes(header, batteryColumn))
  const batteryType = _.trim(header.split(batteryColumn)[0])
  return {
    batteryType,
    batteryTypeErrors: _.isString(batteryType)
      ? null
      : `Cannot determine battery type. Looking for a column called '___ ${batteryColumn}'`,
  }
}

export function getGeneratorType(headers) {
  const generatorColumn = 'genset'
  const header = _.find(headers, header => _.includes(header.toLowerCase(), generatorColumn))
  const generatorType = header ? _.trim(header.split('Power Output')[0]) : 'Not Found'
  return {
    generatorType,
    generatorTypeErrors: null,
  }
}
