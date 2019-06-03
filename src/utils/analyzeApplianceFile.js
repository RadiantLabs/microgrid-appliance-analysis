import _ from 'lodash'
import prettyBytes from 'pretty-bytes'
import moment from 'moment'
import { logger } from './logger'
import { hasColumnHeaders, momentApplianceParseFormats, isFileCsv, getMonth } from './helpers'

// Column names used if downloading a template
const requiredColumnsCamel = [
  'datetime',
  'hour',
  'dayOfWeek',
  'hourOfDay',
  'hourOfWeek',
  'month',
  'kwFactor',
]

// Column names used if using export of Python appliance generator
const requiredColumnsSnake = ['datetime', 'hour', 'day', 'hour_of_day', 'hour_of_week', 'kw_factor']

export function analyzeApplianceFile(parsedFile, fileInfo) {
  const { isSample, fileType, size, mimeType } = fileInfo
  let fileImportErrors = []
  let fileImportWarnings = []
  const fileIsCsv = isSample ? true : isFileCsv(mimeType)
  if (fileType !== 'appliance') {
    fileImportErrors.push(`File is not applliance file. Current fileType: ${fileType}`)
  }
  if (!fileIsCsv) {
    fileImportErrors.push(`File is not a CSV. If you have an Excel file, export as CSV.`)
  }
  const headers = _.keys(_.first(parsedFile.data))
  if (!hasColumnHeaders(headers)) {
    fileImportErrors.push(
      `This file appears to not have column header descriptions. The first row of the HOMER file should contain the column name and the second row contain the column units.`
    )
  }
  // 5MB limit
  if (size > 1048576 * 5) {
    fileImportErrors.push(`Filesize too big. Your file is ${prettyBytes(size)}`)
  }
  const dateExample = parsedFile.data[0].datetime
  if (!moment(dateExample, momentApplianceParseFormats).isValid()) {
    fileImportErrors.push(
      `Appliance date format is incorrect. It should be of the format 'YYYY-MM-DD hh:mm:ss'. For exmaple, 2018-01-01 00:00:00`
    )
  }

  const requiredColumnsErrors = checkRequiredApplianceColumns(parsedFile.data)
  fileImportErrors.push(requiredColumnsErrors)
  const processedData = _.map(parsedFile.data, row => {
    const processedRow = {
      ...row,
      ...{ kwFactor: flexibleColumnName(row, 'kw_factor', 'kwFactor', 5) },
      ...{ hourOfDay: flexibleColumnName(row, 'hour_of_day', 'hourOfDay') },
      ...{ hourOfWeek: flexibleColumnName(row, 'hour_of_week', 'hourOfWeek') },
      ...{ dayOfWeek: flexibleColumnName(row, 'day', 'dayOfWeek') },
      ...{ month: getMonth(row['datetime']) },
    }

    // Convert incoming to camel case
    return _.omit(processedRow, [
      'production_factor',
      'kw_factor',
      'hour_of_day',
      'hour_of_week',
      'day',
    ])
  })

  return {
    fileInfo,
    fileData: processedData,
    fileImportErrors: _.compact(fileImportErrors),
    fileImportWarnings: _.compact(fileImportWarnings), // Not currently used
    fileType,
  }
}

function flexibleColumnName(row, case1, case2, decimals) {
  if (!_.has(row, case1) && !_.has(row, case2)) {
    logger(`Did not find camel or snake case version of ${case1} for appliance import `)
  }
  const val = _.has(row, case1) ? row[case1] : row[case2]
  return decimals ? _.round(val, decimals) : val
}

// _____________________________________________________________________________
// Check that Appliance files has the right columns for calculations
// _____________________________________________________________________________
function checkRequiredApplianceColumns(fileData) {
  const headers = _.keys(_.first(fileData))
  const isSnake = _.includes(headers.join(''), '_')
  const requiredErrors = isSnake
    ? _.compact(_.map(requiredColumnsSnake, col => (_.includes(headers, col) ? null : col)))
    : _.compact(_.map(requiredColumnsCamel, col => (_.includes(headers, col) ? null : col)))
  return _.isEmpty(requiredErrors) ? null : `Missing required columns: ${requiredErrors.join(', ')}`
}
