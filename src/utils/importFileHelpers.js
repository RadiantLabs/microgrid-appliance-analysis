import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import Papa from 'papaparse'
import { findColMax, findColMin, findColAverage } from './helpers'
import { homerParseFormat, applianceParseFormat } from './constants'
import { predictOriginalBatteryEnergyContent } from '../utils/predictBatteryEnergyContent'
export const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }

/**
 * Process files on import
 */
function isFileCsv(fileType) {
  return fileType === 'text/csv'
}

function hasColumnHeaders(headers) {
  const header4 = parseFloat(headers[3])
  const header5 = parseFloat(headers[4])
  return !_.isFinite(header4) && !_.isFinite(header5)
}

function getGridPowerType(headers) {
  const hasDC = _.some(headers, header => _.includes(header, 'DC Primary Load'))
  const hasAC = _.some(headers, header => _.includes(header, 'AC Primary Load'))
  if (hasDC && hasAC) {
    // TODO: log errors for monitoring
  }
  return {
    powerType: hasDC ? 'DC' : 'AC',
    powerTypeErrors:
      hasDC && hasAC
        ? "This grid appears to have both AC and DC power types, which we don't currently support. Please contact support."
        : null,
  }
}

function getPvType(headers) {
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

function getBatteryType(headers) {
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

function getGeneratorType(headers) {
  const generatorColumn = 'Genset Power Output'
  const header = _.find(headers, header => _.includes(header, generatorColumn))
  const generatorType = header ? _.trim(header.split(generatorColumn)[0]) : 'Not Found'
  return {
    generatorType,
    generatorTypeErrors: null,
  }
}

/**
 * First detect equipment type based on headers (battery type, pv type, generator type...)
 * Then rename those header to be consistent so we can use them for calculations
 */
function dropUnitsRow(rows) {
  return _.drop(rows, 1)
}

function renameHomerKeys({ row, pvType, batteryType, generatorType }) {
  return _.mapKeys(row, (val, key) => {
    switch (true) {
      // Replace names of all battery columns
      case _.includes(key, batteryType):
        return _.replace(key, batteryType, 'Original Battery')
      // Replace names of all PV columns
      // TODO: PV Solar Altitude won't necessarily start with PV
      case _.includes(key, pvType):
        return _.replace(key, `${pvType} `, 'PV ')
      // Replace names of all generator columns
      // TODO: get more examples of generators
      case _.includes(key, generatorType):
        return _.replace(key, `${generatorType} `, 'Generator')
      case _.includes(key, 'Unmet Electrical Load'):
        return 'Original Unmet Electrical Load'
      case _.includes(key, 'Excess Electrical Production'):
        return 'Original Excess Electrical Production'
      default:
        return key
    }
  })
}

function calculateNewHomerColumns({ fileData, batteryMinEnergyContent, batteryMaxEnergyContent }) {
  const newColumns = _.map(fileData, (row, rowIndex, rows) => {
    // Get existing values from the current row we are iterating over:
    // Excess electrical production:  Original energy production minus original load (not new
    // appliances) when the battery is charging as fast as possible
    const originalBatteryEnergyContent = row['Original Battery Energy Content']

    // TODO: Eventually add other power generation to this value.
    // HOMER should have column `Total Power Output` (renewable plus generator)
    const totalElectricalProduction = row['Total Renewable Power Output']

    // electricalProductionLoadDiff is the kW in 1 hour produced
    // If excess (positive), `Inverter Power Input` kicks in
    // If deficit (negative), `Rectifier Power Input` kicks in
    const originalElectricalProductionLoadDiff =
      totalElectricalProduction - row['Total Electrical Load Served']

    const datetime = row['Time']
    const dateObject = DateTime.fromISO(datetime)
    return {
      datetime,
      hour_of_day: dateObject.hour,
      originalBatteryEnergyContent: _.round(originalBatteryEnergyContent, 4),
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      originalElectricalProductionLoadDiff: _.round(originalElectricalProductionLoadDiff, 4),
      ..._.omit(row, ['Unmet Electrical Load', 'Original Battery Energy Content']),
    }
  })
  const withBatteryPredictions = predictOriginalBatteryEnergyContent(
    newColumns,
    batteryMinEnergyContent,
    batteryMaxEnergyContent
  )
  return withBatteryPredictions
}

export function prepHomerData({ parsedFile, pvType, batteryType, generatorType }) {
  const renamedRows = _.map(dropUnitsRow(parsedFile.data), (row, rowIndex) => {
    return renameHomerKeys({ row, pvType, batteryType, generatorType })
  })

  const modifiedTable = _.map(renamedRows, (row, rowIndex) => {
    return _.mapValues(row, (val, key) => {
      if (key === 'Time') {
        return DateTime.fromFormat(val, homerParseFormat).toISO()
      }
      return _.round(val, 5)
    })
  })
  return addHourIndex(modifiedTable)
}

// Add a column to table that autoincrements based on row index
function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    return { ...row, ...{ hour: rowIndex } }
  })
}

export function analyzeHomerFile(parsedFile, fileInfo) {
  const { isSample, fileType, size, mimeType } = fileInfo
  let errors = []
  const fileIsCsv = isSample ? true : isFileCsv(mimeType)
  const headers = _.keys(_.first(parsedFile.data))
  if (!hasColumnHeaders(headers)) {
    errors.push(
      `This file appears to not have column header descriptions. The first row of the HOMER file should contain the column name and the second row contain the column units.`
    )
  }
  if (fileType !== 'homer') {
    errors.push(`File is not homer file. Current fileType: ${fileType}`)
  }
  if (!fileIsCsv) {
    errors.push(`File is not a CSV. If you have an Excel file, export as CSV.`)
  }
  // 5MB limit
  if (size > 1048576 * 5) {
    errors.push(`Filesize too big. Your file is ${prettyBytes(size)}`)
  }

  const { powerType, powerTypeErrors } = getGridPowerType(headers)
  errors.push(powerTypeErrors)
  const { pvType, pvTypeErrors } = getPvType(headers)
  errors.push(pvTypeErrors)
  const { batteryType, batteryTypeErrors } = getBatteryType(headers)
  errors.push(batteryTypeErrors)
  const { generatorType, generatorTypeErrors } = getGeneratorType(headers)
  errors.push(generatorTypeErrors)

  const fileData = prepHomerData({ parsedFile, pvType, batteryType, generatorType })

  // Calculate battery minimum by looking at when HOMER decides we have unmet loads
  // This seems to slowly lower over a year by about 1 kWh. So take all unmet load
  // hours and average the battery energy content over the course of a year.
  // That gets us within +/- 0.5 kWh.
  const unmetLoadHours = _.filter(fileData, row => {
    return _.round(row['Original Unmet Electrical Load'], 5) > 0
  })
  const batteryMinEnergyContent = findColAverage(unmetLoadHours, 'Original Battery Energy Content')
  const batteryMaxEnergyContent = findColMax(fileData, 'Original Battery Energy Content')
  const batteryMaxSoC = findColMax(fileData, 'Original Battery State of Charge')
  const batteryMinSoC = findColMin(fileData, 'Original Battery State of Charge')

  const withCalculatedColumns = calculateNewHomerColumns({
    fileData,
    batteryMinEnergyContent,
    batteryMaxEnergyContent,
  })
  return {
    // TODO NEXT: See where this file returns to and integrate it into the gridmodel
    fileInfo,
    fileData: withCalculatedColumns,
    fileErrors: _.compact(errors),
    fileWarnings: parsedFile.errors,
    powerType,
    pvType,
    batteryType,
    generatorType,
    batteryMaxSoC,
    batteryMinSoC,
    batteryMaxEnergyContent,
    batteryMinEnergyContent,
  }
}

export function analyzeApplianceFile(parsedFile, fileInfo) {
  const { isSample, fileType, size } = fileInfo
  const mimeType = 'TODO'
  let fileErrors = []
  let fileWarnings = []
  const fileIsCsv = isSample ? true : isFileCsv(mimeType)
  if (fileType !== 'appliance') {
    fileErrors.push(`File is not applliance file. Current fileType: ${fileType}`)
  }
  if (!fileIsCsv) {
    fileErrors.push(`File is not a CSV. If you have an Excel file, export as CSV.`)
  }
  const headers = _.keys(_.first(parsedFile.data))
  if (!hasColumnHeaders(headers)) {
    fileErrors.push(
      `This file appears to not have column header descriptions. The first row of the HOMER file should contain the column name and the second row contain the column units.`
    )
  }
  // 5MB limit
  if (size > 1048576 * 5) {
    fileErrors.push(`Filesize too big. Your file is ${prettyBytes(size)}`)
  }
  const processedData = _.map(parsedFile.data, row => {
    const trimmedRow = _.omit(row, ['production_factor'])
    return {
      ...trimmedRow,
      ...{ kw_factor: _.round(row['kw_factor'], 5) },
    }
  })
  return {
    fileInfo,
    fileData: processedData,
    fileErrors,
    fileWarnings,
    fileType,
  }
}

// _____________________________________________________________________________
// Legacy functions below this. These will be replaced.
// _____________________________________________________________________________
export function processApplianceFile(rows, fileInfo) {
  return _.map(rows, row => {
    return {
      ...row,
      ...{
        // Convert all dates into ISO 8606 format. Format them for display elsewhere
        datetime: DateTime.fromFormat(row['datetime'], applianceParseFormat).toISO(),
        kw_factor: _.round(row['kw_factor'], 5),
        production_factor: _.round(row['production_factor'], 5),
      },
    }
  })
}

export function filePathLookup(fileName, fileType, urlLocation) {
  const levelsDeep = urlLocation.pathname.split('/').length
  const relativePathCount = _.repeat('../', levelsDeep - 1)
  switch (fileType) {
    case 'homer':
      return relativePathCount + 'data/homer/' + fileName + '.csv'
    case 'appliance':
      return relativePathCount + 'data/appliances/' + fileName + '.csv'
    default:
      throw new Error(`Need to pass fileType (homer, appliance) to filePathLookup`)
  }
}

/**
 * Fetch Homer or Usage profile files from samples.
 * @param {*} fileId
 */
export async function fetchSnapshotGridFile(fileInfo) {
  // console.log('fetchSnapshotGridFile: ', fileInfo)
  return []
}

export async function fetchSnapshotApplianceFile(fileInfo) {
  // console.log('fetchSnapshotGridFile: ', fileInfo)
  return []
}

/**
 * Fetch Homer or Usage profile files from samples.
 * @param {*} fileId
 */
export async function fetchSampleFile(fileInfo, urlLocation) {
  const filePath = filePathLookup(fileInfo.name, fileInfo.fileType, urlLocation)
  try {
    const res = await window.fetch(filePath)
    const csv = await res.text()
    const parsedFile = Papa.parse(csv, csvOptions)
    if (!_.isEmpty(parsedFile.errors)) {
      throw new Error(`Problem parsing grid CSV: ${JSON.stringify(parsedFile.errors)}`)
    }
    switch (fileInfo.fileType) {
      case 'homer':
        return analyzeHomerFile(parsedFile, fileInfo)
      case 'appliance':
        return analyzeApplianceFile(parsedFile, fileInfo)
      default:
        throw new Error(
          `Expected either a 'homer' for 'appliance' file in fetchSampleFile. Got ${
            fileInfo.fileType
          }`
        )
    }
  } catch (error) {
    console.error(
      `File load fail for : ${filePath}. Make sure appliance CSV has all headers.`,
      error
    )
  }
}

/**
 * Fetch Homer or Usage profile files from samples.
 * @param {*} fileInfo
 */
export async function fetchFile(fileInfo, urlLocation) {
  if (_.isEmpty(fileInfo)) {
    throw new Error(`fileInfo not found in fetchSampleFile`)
  }
  const { fileName, fileType } = fileInfo
  const filePath = filePathLookup(fileName, fileType, urlLocation)
  try {
    const res = await window.fetch(filePath)
    const csv = await res.text()
    const parsedFile = Papa.parse(csv, csvOptions)
    const { data, errors } = parsedFile
    if (!_.isEmpty(errors)) {
      throw new Error(`Problem parsing CSV: ${JSON.stringify(errors)}`)
    }
    switch (fileType) {
      case 'homer':
        return parsedFile
      case 'appliance':
        return processApplianceFile(data, fileInfo)
      default:
        throw new Error(`File fetched does not have a known type: ${JSON.stringify(fileInfo)}`)
    }
  } catch (error) {
    console.error(
      `File load fail for : ${filePath}. Make sure appliance CSV has all headers.`,
      error
    )
  }
}
