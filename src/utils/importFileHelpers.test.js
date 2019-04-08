// import _ from 'lodash'
import { fetchSampleFile } from './importFileHelpers'

const fileInfo = {
  fileType: 'homer',
  id: '12-50 Undersize 20_2019-02-16T20:34:53.869-07:00',
  isSample: false,
  name: '12-50 Baseline',
  size: 2108574,
  timestamp: '2019-02-16T20:34:53.869-07:00',
}
const windowLocation = {
  href: 'http://localhost:3000/files/homer',
  ancestorOrigins: {},
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/files/homer',
  search: '',
  hash: '',
}

// const mimeType = "text/csv"
// const oversize = '12-50 Oversize 20.csv'

describe('Parsing and detect columns in example HOMER files', () => {
  test('fetchSampleFile on HOMER', async () => {
    expect.assertions(1)
    const analyzedFile = await fetchSampleFile(fileInfo, windowLocation)
    expect(analyzedFile).toStrictEqual({
      batteryEnergyContent: 79.2,
      newExcessProduction: 0,
      newUnmetLoad: 0,
    })
  })
})

// const app = {
//   href: 'http://localhost:3000/files/homer',
//   ancestorOrigins: {},
//   origin: 'http://localhost:3000',
//   protocol: 'http:',
//   host: 'localhost:3000',
//   hostname: 'localhost',
//   port: '3000',
//   pathname: '/files/homer',
//   search: '',
//   hash: '',
// }
// const tst = {
//   href: 'http://localhost/',
//   origin: 'http://localhost',
//   protocol: 'http:',
//   host: 'localhost',
//   hostname: 'localhost',
//   port: '',
//   pathname: '/',
//   search: '',
//   hash: '',
// }
