import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
// import { DateTime } from 'luxon'
// import { isLuxonObject, isValidLuxonDate } from './helpers'
import { analyzeApplianceFile } from './analyzeApplianceFile'
import { csvOptions } from './helpers'

// analyzeApplianceFile requires a fileInfo object, which includes the name of the
// file. But I'm not testing this aspect of analyzeApplianceFile. So even though
// analyzeApplianceFile will return a fileInfo with the wrong name, I don' check that.
const fileInfo = {
  fileType: 'appliance',
  id: 'some_name_20_2019-02-16T20:34:53.869-07:00',
  isSample: false,
  name: 'some_name_',
  size: 2108574,
  timestamp: '2019-02-16T20:34:53.869-07:00',
  mimeType: 'text/csv',
}
const fileDir = '../../public/data'

function loadAndAnalyzeFile(fileName) {
  const csv = fs.readFileSync(path.resolve(__dirname, fileDir, fileName), 'utf8')
  const parsedFile = Papa.parse(csv, csvOptions)
  return analyzeApplianceFile(parsedFile, fileInfo)
}

// Every parsed appliance file should meet these criteria:
function commonExpectations(result) {
  expect(result).toHaveProperty('fileData')
  expect(_.size(result.fileData)).toBe(8760)
  expect(result).toHaveProperty('fileInfo')
  expect(_.isString(result.fileInfo.id)).toBe(true)
  expect(_.isString(result.fileInfo.fileType)).toBe(true)
  expect(_.isBoolean(result.fileInfo.isSample)).toBe(true)
  expect(_.isString(result.fileInfo.name)).toBe(true)
  expect(_.isNumber(result.fileInfo.size)).toBe(true)
  expect(_.isString(result.fileInfo.timestamp)).toBe(true)

  if (!_.isEmpty(result.fileImportErrors)) {
    console.log('fileImportErrors: ', result.fileImportErrors)
  }
  if (!_.isEmpty(result.fileImportWarnings)) {
    console.log('fileImportWarnings: ', result.fileImportWarnings)
  }
  expect(_.isEmpty(result.fileImportErrors)).toBe(true)
  expect(_.isEmpty(result.fileImportWarnings)).toBe(true)

  // Currently there is a difference in how node.js and the browser parses dates.
  // This sounds like a pain to fix. May want to just switch to Moment.js
  // http://moment.github.io/luxon/docs/manual/install.html#node
  // const { datetime } = result.fileData[0]
  // console.log('result.fileData: ', result.fileData[0])
  // console.log(DateTime.fromISO(datetime))
}

describe('Parsing and detect columns in example Appliances files', () => {
  test('analyzedFile for maize_mill_usage_profile_1 (Appliances)', () => {
    const result = loadAndAnalyzeFile('appliances/test_files/maize_mill_usage_profile_1.csv')
    commonExpectations(result)
  })
  test('analyzedFile for maize_mill_usage_profile_2 (Appliances)', () => {
    const result = loadAndAnalyzeFile('appliances/test_files/maize_mill_usage_profile_2.csv')
    commonExpectations(result)
  })
  test('analyzedFile for rice_mill_usage_profile (Appliances)', () => {
    const result = loadAndAnalyzeFile('appliances/test_files/rice_mill_usage_profile.csv')
    commonExpectations(result)
  })
  test('analyzedFile for welder_usage_profile (Appliances)', () => {
    const result = loadAndAnalyzeFile('appliances/test_files/welder_usage_profile.csv')
    commonExpectations(result)
  })
})
