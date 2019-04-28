import _ from 'lodash'
import prettyBytes from 'pretty-bytes'
import moment from 'moment'
import { hasColumnHeaders, momentApplianceParseFormats, isFileCsv, getMonth } from './helpers'

const requiredColumns = [
  'datetime',
  // 'Wut', // for debugging
  'hour',
  'day',
  'hour_of_day',
  'day_hour',
  'kw_factor',
]

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
      ...{ kwFactor: _.round(row['kw_factor'], 5) },
      ...{ hourOfDay: row['hour_of_day'] },
      ...{ dayHour: row['day_hour'] },
      ...{ dayOfWeek: row['day'] },
      ...{ month: getMonth(row['datetime']) },
    }
    // Convert incoming to camel case
    return _.omit(processedRow, [
      'production_factor',
      'kw_factor',
      'hour_of_day',
      'day_hour',
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

// _____________________________________________________________________________
// Check that Appliance files has the right columns for calculations
// _____________________________________________________________________________
function checkRequiredApplianceColumns(fileData) {
  const headers = _.keys(_.first(fileData))
  const requiredErrors = _.map(requiredColumns, col => (_.includes(headers, col) ? null : col))
  const errors = _.compact(requiredErrors)
  return _.isEmpty(errors) ? null : `Missing required columns: ${requiredErrors.join(', ')}`
}
