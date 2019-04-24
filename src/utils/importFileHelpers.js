import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import Papa from 'papaparse'
import moment from 'moment'
import {
  findColMax,
  findColMin,
  momentApplianceParseFormats,
  parseHomerDateFormats,
  stripDuplicateWhitespace,
} from './helpers'
import { applianceParseFormat } from './constants'
import { predictOriginalBatteryEnergyContent } from '../utils/predictBatteryEnergyContent'
import {
  hasColumnHeaders,
  getGridPowerType,
  getPvType,
  getBatteryType,
  getGeneratorType,
} from './columnDetectors'
import { logger } from './logger'

export const csvOptions = {
  header: true,
  delimiter: ',',
  dynamicTyping: true,
  skipEmptyLines: true,
  comments: 'sep=',
}

/**
 * Process files on import
 */
function isFileCsv(fileType) {
  return fileType === 'text/csv'
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
        return stripDuplicateWhitespace(_.replace(key, batteryType, 'Original Battery'))

      // Replace names of all PV columns
      // TODO: PV Solar Altitude won't necessarily start with PV
      case _.includes(key, pvType):
        return stripDuplicateWhitespace(_.replace(key, `${pvType} `, 'PV '))

      // Replace names of all generator columns
      // TODO: get more examples of generators
      case _.includes(key, generatorType):
        return stripDuplicateWhitespace(_.replace(key, `${generatorType} `, 'Generator'))

      case _.includes(key, 'Unmet Electrical Load'):
        return 'Original Unmet Electrical Load'
      case _.includes(key, 'Excess Electrical Production'):
        return 'Original Excess Electrical Production'
      case _.includes(key, 'Total Electrical Load Served'):
        return 'Original Electrical Load Served'
      default:
        return key
    }
  })
}

function calculateNewHomerColumns({ fileData, batteryMinEnergyContent, batteryMaxEnergyContent }) {
  return _.map(fileData, (row, rowIndex, rows) => {
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
      totalElectricalProduction - row['Original Electrical Load Served']

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
}

export function prepHomerData({ parsedFile, pvType, batteryType, generatorType }) {
  const renamedRows = _.map(dropUnitsRow(parsedFile.data), (row, rowIndex) => {
    return renameHomerKeys({ row, pvType, batteryType, generatorType })
  })

  const modifiedTable = _.map(renamedRows, (row, rowIndex) => {
    return _.mapValues(row, (val, key) => {
      if (key === 'Time') {
        // return DateTime.fromFormat(val, homerParseFormat).toISO()
        return parseHomerDateFormats(val)
      }
      return _.round(val, 4)
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

  const batteryEstimatedMinEnergyContent = findColMin(fileData, 'Original Battery Energy Content')
  const batteryEstimatedMaxEnergyContent = findColMax(fileData, 'Original Battery Energy Content')
  const batteryMaxSoC = findColMax(fileData, 'Original Battery State of Charge')
  const batteryMinSoC = findColMin(fileData, 'Original Battery State of Charge')

  const withCalculatedColumns = calculateNewHomerColumns({
    fileData,
    batteryMinEnergyContent: batteryEstimatedMinEnergyContent,
    batteryMaxEnergyContent: batteryEstimatedMaxEnergyContent,
  })

  const withBatteryPredictions = predictOriginalBatteryEnergyContent(
    withCalculatedColumns,
    batteryEstimatedMinEnergyContent,
    batteryEstimatedMaxEnergyContent
  )

  return {
    fileInfo,
    fileData: withBatteryPredictions,
    fileErrors: _.compact(errors),
    fileWarnings: parsedFile.errors,
    powerType,
    pvType,
    batteryType,
    generatorType,
    batteryMaxSoC: _.round(batteryMaxSoC, 2),
    batteryMinSoC: _.round(batteryMinSoC, 2),
    batteryEstimatedMaxEnergyContent: _.round(batteryEstimatedMaxEnergyContent, 4),
    batteryEstimatedMinEnergyContent: _.round(batteryEstimatedMinEnergyContent, 4),
  }
}

export function analyzeApplianceFile(parsedFile, fileInfo) {
  const { isSample, fileType, size, mimeType } = fileInfo
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
  const dateExample = parsedFile.data[0].datetime
  if (!moment(dateExample, momentApplianceParseFormats).isValid()) {
    fileErrors.push(
      `Appliance date format is incorrect. It should be of the format 'YYYY-MM-DD hh:mm:ss'. For exmaple, 2018-01-01 00:00:00`
    )
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
      logger(`Need to pass fileType (homer, appliance) to filePathLookup`)
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
    const res = await fetch(filePath)
    const csv = await res.text()
    const parsedFile = Papa.parse(csv, csvOptions)
    if (!_.isEmpty(parsedFile.errors)) {
      logger(`Problem parsing grid CSV: ${JSON.stringify(parsedFile.errors)}`)
    }
    switch (fileInfo.fileType) {
      case 'homer':
        return analyzeHomerFile(parsedFile, fileInfo)
      case 'appliance':
        return analyzeApplianceFile(parsedFile, fileInfo)
      default:
        logger(
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
