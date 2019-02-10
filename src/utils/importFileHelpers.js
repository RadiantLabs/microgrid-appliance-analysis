import _ from 'lodash'
import { DateTime } from 'luxon'
import prettyBytes from 'pretty-bytes'
import { homerParseFormat, applianceParseFormat } from './constants'
import Papa from 'papaparse'
export const csvOptions = { header: true, dynamicTyping: true, skipEmptyLines: true }

/**
 * Process files on import
 */
function isFileCsv(rawFile) {
  return rawFile.type === 'text/csv'
}
function hasColumnHeaders(headers) {
  const header4 = parseFloat(headers[3])
  const header5 = parseFloat(headers[3])
  return _.isFinite(header4) && _.isFinite(header5)
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

function getBatteryType(headers) {
  // TODO
  return {
    batteryType: '',
    batteryTypeErrors: '',
  }
}

function getGeneratorType(headers) {
  // TODO
  return {
    generatorType: '',
    generatorTypeErrors: '',
  }
}

export function verifyHomerFile(rawFile, parsedFile) {
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

  const { batteryType, batteryTypeErrors } = getBatteryType(headers)
  errors.push(batteryTypeErrors)

  const { generatorType, generatorTypeErrors } = getGeneratorType(headers)
  errors.push(generatorTypeErrors)

  return {
    fileName: String(name).split('.')[0],
    fileSize: size,
    fileErrors: _.compact(errors),
    fileWarnings: parsedFile.errors,
    powerType,
    batteryType,
    generatorType,
  }
}

// Add a column to table that autoincrements based on row index
function addHourIndex(rows) {
  return _.map(rows, (row, rowIndex) => {
    return { ...row, ...{ hour: rowIndex } }
  })
}

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
