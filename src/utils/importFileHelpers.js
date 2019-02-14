import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import Papa from 'papaparse'
import { findColMax, findColMin } from 'utils/helpers'
import { homerParseFormat, applianceParseFormat } from './constants'
export const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }

/**
 * Process files on import
 */
function isFileCsv(rawFile) {
  return rawFile.type === 'text/csv'
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

function renameHomerKeys2({ row, pvType, batteryType, generatorType }) {
  return _.mapKeys(row, (val, key) => {
    switch (true) {
      // Replace names of all battery columns
      case _.includes(key, batteryType):
        return _.replace(key, batteryType, 'Battery')

      // Replace names of all PV columns
      // TODO: PV Solar Altitude won't necessarily start with PV
      case _.includes(key, pvType):
        return _.replace(key, `${pvType} `, 'PV ')

      // Replace names of all generator columns
      // TODO: get more examples of generators
      case _.includes(key, generatorType):
        return _.replace(key, `${generatorType} `, 'Generator')
      default:
        return key
    }
  })
}

function calculateNewHomerColumns({ fileData, batteryMinSoC, batteryMinEnergyContent }) {
  return _.map(fileData, (row, rowIndex, rows) => {
    // Get the previous HOMER row
    const prevRow = rowIndex === 0 ? {} : rows[rowIndex - 1]

    // Get existing values from the current row we are iterating over:
    // Excess electrical production:  Original energy production minus original load (not new
    // appliances) when the battery is charging as fast as possible
    const excessElecProd = row['Excess Electrical Production']
    const batteryEnergyContent = row['Battery Energy Content']
    const batterySOC = row['Battery State of Charge']

    const prevBatteryEnergyContent =
      rowIndex === 0 ? row['Battery Energy Content'] : prevRow['Battery Energy Content']

    const prevBatterySOC =
      rowIndex === 0 ? row['Battery State of Charge'] : prevRow['Battery State of Charge']

    // TODO: Eventually add other generation to this value
    const totalElectricalProduction = row['PV Power Output']

    // electricalProductionLoadDiff defines whether we are producing excess (positive)
    // or in deficit (negative).
    // If excess (positive), `Inverter Power Input` kicks in
    // If deficit (negative), `Rectifier Power Input` kicks in
    const electricalProductionLoadDiff =
      totalElectricalProduction - row['Total Electrical Load Served']

    // The energy content above what HOMER (or the user) decides is the Minimum
    // Energy content the battery should have
    const energyContentAboveMin = batteryEnergyContent - batteryMinEnergyContent

    // Find available capacity (kW) before the new appliance is added
    const availableCapacity =
      excessElecProd + (batterySOC <= batteryMinSoC ? 0 : energyContentAboveMin)

    // Original Battery Energy Content Delta
    // This is how much the energy content in the battery has increased or decreased in
    // the last hour. First row is meaningless when referencing previous row, so set it to zero
    const originalBatteryEnergyContentDelta =
      rowIndex === 0 ? 0 : batteryEnergyContent - prevBatteryEnergyContent

    const datetime = row['Time']
    const dateObject = DateTime.fromISO(datetime)
    return {
      datetime,
      hour_of_day: dateObject.hour,
      // day: applianceRow['day'],
      // day_hour: applianceRow['day_hour'],
      totalElectricalProduction: _.round(totalElectricalProduction, 4),
      electricalProductionLoadDiff: _.round(electricalProductionLoadDiff, 4),
      prevBatterySOC: _.round(prevBatterySOC, 4),
      prevBatteryEnergyContent: _.round(prevBatteryEnergyContent, 4),
      energyContentAboveMin: _.round(energyContentAboveMin, 4),
      availableCapacity: _.round(availableCapacity, 4),
      originalBatteryEnergyContentDelta: _.round(originalBatteryEnergyContentDelta, 4),
      ...row,
    }
  })
}

export function prepHomerData({ parsedFile, pvType, batteryType, generatorType }) {
  const renamedRows = _.map(dropUnitsRow(parsedFile.data), (row, rowIndex) => {
    return renameHomerKeys2({ row, pvType, batteryType, generatorType })
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

export function analyzeHomerFile(rawFile, parsedFile) {
  let errors = []
  const { size, name } = rawFile
  const fileIsCsv = isFileCsv(rawFile)
  const headers = _.keys(_.first(parsedFile.data))
  if (!hasColumnHeaders(headers)) {
    errors.push(
      `This file appears to not have column header descriptions. The first row of the HOMER file should contain the column name and the second row contain the column units.`
    )
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
  const batteryMaxSoC = findColMax(fileData, 'Battery State of Charge')
  const batteryMinSoC = findColMin(fileData, 'Battery State of Charge')
  const batteryMaxEnergyContent = findColMax(fileData, 'Battery Energy Content')
  const batteryMinEnergyContent = findColMin(fileData, 'Battery Energy Content')

  const withCalculatedColumns = calculateNewHomerColumns({
    fileData,
    batteryMinSoC,
    batteryMinEnergyContent,
  })

  return {
    fileName: String(name).split('.')[0],
    fileData: withCalculatedColumns,
    fileSize: size,
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

// Add a column to table that autoincrements based on row index
function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    return { ...row, ...{ hour: rowIndex } }
  })
}

// _____________________________________________________________________________
// Legacy functions below this. These will be replaced.
// _____________________________________________________________________________
// Rename HOMER column names so we have consistent variables to do calculations with.
// If HOMER had Litium Ion batteries, all calculations would break. Example of changes:
// "Generic 1kWh Lead Acid [ASM] Energy Content" => "Battery Energy Content"
// "Generic flat plate PV Solar Altitude" => "PV Solar Altitude"
function renameHomerKeys(row, fileInfo) {
  const { battery, pvSystem } = fileInfo.attributes
  return _.mapKeys(row, (val, key) => {
    switch (true) {
      case _.includes(key, battery):
        return _.replace(key, battery, 'Battery')
      // TODO: PV Solar Altitude won't necessarily start with PV
      case _.includes(key, pvSystem):
        return _.replace(key, `${pvSystem} `, '')
      default:
        return key
    }
  })
}

// Convert output from raw CSV parse into something that React Virtualized can display
// Drop the first after parsing which is the units row.
export function processHomerFile(rows, fileInfo) {
  const renamedRows = _.map(_.drop(rows, 1), (row, rowIndex) => {
    return renameHomerKeys(row, fileInfo)
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
      throw new Error(`Need to pase fileType (homer, appliance) to filePathLookup`)
  }
}

/**
 * Fetch Homer or Usage profile files.
 * @param {*} fileInfo
 */
export async function fetchFile(fileInfo, urlLocation) {
  if (_.isEmpty(fileInfo)) {
    throw new Error(`fileInfo not found in fetchFile`)
  }
  const { fileName, type } = fileInfo
  const filePath = filePathLookup(fileName, type, urlLocation)
  try {
    const res = await window.fetch(filePath)
    const csv = await res.text()
    const { data, errors } = Papa.parse(csv, csvOptions)
    if (!_.isEmpty(errors)) {
      throw new Error(`Problem parsing CSV: ${JSON.stringify(errors)}`)
    }
    switch (type) {
      case 'homer':
        return processHomerFile(data, fileInfo)
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
