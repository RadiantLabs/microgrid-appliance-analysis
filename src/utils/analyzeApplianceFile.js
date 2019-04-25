import _ from 'lodash'
import prettyBytes from 'pretty-bytes'
import moment from 'moment'
import { hasColumnHeaders, momentApplianceParseFormats, isFileCsv } from './helpers'

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
