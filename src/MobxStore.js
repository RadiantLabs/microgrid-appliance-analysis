import { configure, observable, decorate, action, runInAction } from 'mobx'
// import Papa from 'papaparse'
import _ from 'lodash'
import { fetchFile } from './storeUtils'
// const csvOptions = { header: true, dynamicTyping: true }
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
    type: 'homer',
    label: 'homer_12_50_oversize_20',
    path: './data/homer_12_50_oversize_20.csv',
    description: 'Fill in description about 12, 50, etc',
  },
]

const applianceFiles = [
  {
    type: 'appliance',
    applianceType: 'Rice Mill',
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
    this.fetchHomer(homerFiles[0])
  }

  get homerIsLoaded() {
    return !_.isEmpty(this.activeHomer)
  }

  async fetchHomer(fileInfo) {
    const homer = await fetchFile(fileInfo)
    runInAction(() => (this.activeHomer = homer))
  }
}

decorate(MobxStore, {
  loading: observable,
  activeHomer: observable,
  fetchHomer: action,
})

export let mobxStore = new MobxStore()
