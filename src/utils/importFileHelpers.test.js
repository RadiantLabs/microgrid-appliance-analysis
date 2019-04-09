import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { csvOptions, analyzeHomerFile } from './importFileHelpers'

// analyzeHomerFile requires a fileInfo object, which includes the name of the
// file. But I'm not testing this aspect of analyzeHomerFile. So even though
// analyzeHomerFile will return a fileInfo with the wrong name, I don' check that.
const fileInfo = {
  fileType: 'homer',
  id: '12-50 Undersize 20_2019-02-16T20:34:53.869-07:00',
  isSample: false,
  name: '12-50 Baseline',
  size: 2108574,
  timestamp: '2019-02-16T20:34:53.869-07:00',
}
const fileDir = '../../public/data'

function loadAndAnalyzeFile(fileName) {
  const csv = fs.readFileSync(path.resolve(__dirname, fileDir, fileName), 'utf8')
  const parsedFile = Papa.parse(csv, csvOptions)
  return analyzeHomerFile(parsedFile, fileInfo)
}

// Every parsed HOMER file should meet these criteria:
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
  expect(result.batteryEstimatedMaxEnergyContent).toBeGreaterThan(1)
  expect(result.batteryEstimatedMinEnergyContent).toBeGreaterThan(1)
  expect(result.batteryMaxSoC).toBeGreaterThan(1)
  expect(result.batteryMinSoC).toBeGreaterThan(1)
}

describe('Parsing and detect columns in example HOMER files', () => {
  test('analyzedFile for 12-50 Baseline (HOMER)', () => {
    const result = loadAndAnalyzeFile('homer/12-50 Baseline.csv')
    commonExpectations(result)
    expect(result).toHaveProperty('generatorType', 'Not Found')
    expect(result).toHaveProperty('powerType', 'AC')
    expect(result).toHaveProperty('pvType', 'Generic flat plate PV')
    expect(result).toHaveProperty('batteryType', 'Generic 1kWh Lead Acid [ASM]')
  })

  test('analyzedFile for 12-50 Oversize 20 (HOMER)', () => {
    const result = loadAndAnalyzeFile('homer/12-50 Oversize 20.csv')
    commonExpectations(result)
    expect(result).toHaveProperty('generatorType', 'Not Found')
    expect(result).toHaveProperty('powerType', 'AC')
    expect(result).toHaveProperty('pvType', 'Generic flat plate PV')
    expect(result).toHaveProperty('batteryType', 'Generic 1kWh Lead Acid [ASM]')
  })

  test('analyzedFile for test_files/2-2-13 Optimized AC LA-gen Output (HOMER)', () => {
    const result = loadAndAnalyzeFile('homer/test_files/2-2-13 Optimized AC LA-gen Output.csv')
    commonExpectations(result)
    expect(result).toHaveProperty('generatorType', 'Autosize Genset')
    expect(result).toHaveProperty('powerType', 'AC')
    expect(result).toHaveProperty('pvType', 'Sunerg Solar')
    expect(result).toHaveProperty('batteryType', 'Generic 1kWh Lead Acid [ASM]')
  })
})
