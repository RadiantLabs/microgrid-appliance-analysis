import { configure, observable, decorate, flow, computed, toJS } from 'mobx'
import Papa from 'papaparse'
import _ from 'lodash'
import { createHeaderRow, addHourIndex } from './storeUtils'
const csvOptions = { header: true, dynamicTyping: true }
configure({ enforceActions: 'observed' })

const homerPath = './data/homer_12_50_oversize_20.csv'

class MobxStore {
  loading = false
  // fetchState = 'pending'
  homer = []

  constructor() {
    this.fetchHomer()
  }

  get homerKeyOrder() {
    return _.keys(this.homer[0])
  }

  get homerHeaderRow() {
    return createHeaderRow(this.homer)
  }

  //
  get homerTableData() {
    if (!_.isEmpty(this.homerHeaderRow)) {
      console.log('it is not empty: ', this.homerHeaderRow)
      // units come in as the first second row, header is the first but
      // const units = _.tail(this.homer)  // not needed yet
      return [this.homerHeaderRow].concat(this.homer)
    } else {
      return []
    }
  }

  get homerIsLoaded() {
    return !_.isEmpty(this.homerTableData)
  }

  fetchHomer = flow(function*() {
    console.log('fetching HOMER file')
    this.fetchState = 'loading'
    try {
      const res = yield window.fetch(homerPath)
      const csv = yield res.text()
      const { data, errors } = Papa.parse(csv, csvOptions)
      if (_.isEmpty(errors)) {
        // this.homer = addHourIndex(data) // TODO
        this.homer = data
      } else {
        console.log('Error loading HOMER file: ', errors)
      }
    } catch (error) {
      console.log('HOMER load faile: ', error)
      this.fetchState = 'error'
    }
  })
}

decorate(MobxStore, {
  loading: observable,
  fetchState: observable,
  homer: observable,
  homerKeyOrder: computed,
  homerHeaderRow: computed,
  homerTableData: computed,
})

// export default MobxStore
export let mobxStore = new MobxStore()
