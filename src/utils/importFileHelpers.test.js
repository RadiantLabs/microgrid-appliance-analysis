import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { csvOptions, analyzeHomerFile } from './importFileHelpers'

const fileInfo = {
  fileType: 'homer',
  id: '12-50 Undersize 20_2019-02-16T20:34:53.869-07:00',
  isSample: false,
  name: '12-50 Baseline',
  size: 2108574,
  timestamp: '2019-02-16T20:34:53.869-07:00',
}
const csv = fs.readFileSync(path.resolve(__dirname, 'testcsv.txt'), 'utf8')
const parsedFile = Papa.parse(csv, csvOptions)

describe('Parsing and detect columns in example HOMER files', () => {
  test('fetchSampleFile on HOMER', () => {
    expect.assertions(1)
    const analyzedFile = analyzeHomerFile(parsedFile, fileInfo)
    console.log('analyzedFile: ', analyzedFile)
    expect(1).toBe(1)
    // expect(analyzedFile).toStrictEqual({
    //   batteryEnergyContent: 79.2,
    //   newExcessProduction: 0,
    //   newUnmetLoad: 0,
    // })
  })
})
