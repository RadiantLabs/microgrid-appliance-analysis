import { configure, observable, decorate, flow, computed } from 'mobx'
import Papa from 'papaparse'
import _ from 'lodash'
import { createHeaderRow, processHomerFile } from './storeUtils'
const csvOptions = { header: true, dynamicTyping: true }
configure({ enforceActions: 'observed' })

// Then have another computed function that takes a loaded appliance
// and inserts it into the HOMER file. Or do I just update the homerKeyOrder
// so the _cellRenderer pulls from the appliance file based on hour index?
// * Parse date and reformat
// * add kw and grain throughput based on factors
// * add hour offset
// * add seasonal derating factor

// Do Calculations like in Adam's spreadsheet - I should probably do that first
// by using the sample data. Then I can add all of the other things ^

const homerFiles = [
  {
    label: 'homer_12_50_oversize_20',
    path: './data/homer_12_50_oversize_20.csv',
    description: 'Fill in description about 12, 50, etc',
  },
]

const applianceFiles = [
  {
    type: 'Rice Mill',
    label: 'sample_mill_usage_profile',
    path: './data/sample_mill_usage_profile.csv',
    description: 'Fill in description about this mill',
  },
]

class MobxStore {
  loading = false
  fetchState = 'pending'
  activeHomer = null
  activeAppliances = null

  constructor() {
    this.fetchHomer()
  }

  get homerIsLoaded() {
    return !_.isEmpty(this.activeHomer)
  }

  fetchHomer = flow(function*() {
    try {
      const res = yield window.fetch(homerFiles[0].path)
      const csv = yield res.text()
      const { data, errors } = Papa.parse(csv, csvOptions)
      if (_.isEmpty(errors)) {
        this.activeHomer = processHomerFile(data)
      } else {
        console.log('Error loading HOMER file: ', errors)
      }
    } catch (error) {
      console.log('HOMER load fail: ', error)
      this.fetchState = 'error'
    }
  })

  // fetchAppliance = flow(function*() {
  //   console.log('fetching Appliance file')
  //   try {
  //     const res = yield window.fetch(applianceFiles[0].path)
  //     const csv = yield res.text()
  //     const { data, errors } = Papa.parse(csv, csvOptions)
  //     if (_.isEmpty(errors)) {
  //       this.applianceRaw = data
  //     } else {
  //       console.log('Error loading HOMER file: ', errors)
  //     }
  //   } catch (error) {
  //     console.log('Appliance load fail: ', error)
  //     this.fetchState = 'error'
  //   }
  // })
}

decorate(MobxStore, {
  loading: observable,
  activeHomer: observable,
  // homerHeaderRow: computed,
  // homerTableData: observable,
})

export let mobxStore = new MobxStore()

// get homerHeaderRow() {
//   return createHeaderRow(this.homerRaw)
// }

// const augmented = addHourIndex(this.homerRaw)
// units come in as the first second row, header is the first but
// const units = _.tail(this.homer)  // not needed yet

//   get homerTableData() {
//   if (_.isEmpty(this.homerHeaderRow)) {
//     return []
//   } else {
//     return
//   }
// }
