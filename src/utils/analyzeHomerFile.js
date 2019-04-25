import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import { predictOriginalBatteryEnergyContent } from '../utils/predictBatteryEnergyContent'
import { getGridPowerType, getPvType, getBatteryType, getGeneratorType } from './columnDetectors'
import {
  findColMax,
  findColMin,
  parseHomerDateFormats,
  stripDuplicateWhitespace,
  isFileCsv,
  addHourIndex,
  hasColumnHeaders,
} from './helpers'

// These are the required columns needed for further calculations.
// These are the column names after renaming to a reliable, calculable name
const requiredColumns = [
  'Time',
  // 'Wat',  // for debugging
  'Original Battery Energy Content',
  'Total Renewable Power Output', // this will change once we have exampels of grids without renewables
  'Original Unmet Electrical Load',
  'Original Excess Electrical Production',
  'Original Electrical Load Served',
]
const requiredOneOfColumns = [['AC Primary Load', 'DC Primary Load']]

// _____________________________________________________________________________
// Primary function that processes the HOMER files
// _____________________________________________________________________________
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

  const requiredColumnErrors = checkRequiredHomerColumns(fileData)
  errors.push(requiredColumnErrors)

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

// _____________________________________________________________________________
// Get the HOMER CSV into a workable format
// _____________________________________________________________________________
// This does 3 things:
// 1. Drops HOMER's second row that contain units
// 2. HOMER's header names depend on the grid configuration, even though they contain
//    the same information. Rename them to make them consistent and something we
//    can do calculations on.
// 3.
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

// The second row of HOMER CSV contains the units of the columns. After parsing
// its now the first row. Get rid of that.
function dropUnitsRow(rows) {
  return _.drop(rows, 1)
}

// First detect equipment type based on headers (battery type, pv type, generator type...)
// Then rename those header to be consistent so we can use them for calculations
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

// _____________________________________________________________________________
// Check that HOMER files has the right columns for calculations
// _____________________________________________________________________________
// These checks are done after renaming columns into reliable, calculable names
function checkRequiredHomerColumns(fileData) {
  const headers = _.keys(_.first(fileData))
  const requiredErrors = _.map(requiredColumns, col => {
    return _.includes(headers, col) ? null : col
  })
  const requiredOneOfErrors = _.map(requiredOneOfColumns, colPair => {
    const hasAtLeastOne = _.includes(headers, colPair[0]) || _.includes(headers, colPair[1])
    return hasAtLeastOne ? null : `One of ${colPair[0]} or ${colPair[1]}`
  })
  const errors = _.concat([], _.compact(requiredErrors), _.compact(requiredOneOfErrors))
  return _.isEmpty(errors)
    ? null
    : `Missing required columns: ${errors.join(
        ', '
      )}. These columns in your HOMER file may be called something else. For example, a HOMER column may be called 'Generic 1kWh Lead Acid Energy Content' but the app will rename it to 'Battery Energy Contnet'. Either way, we need a column that contains the battery energy content and cannot do calculations without it.`
}

// _____________________________________________________________________________
// Add derived columns to table
// _____________________________________________________________________________
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
