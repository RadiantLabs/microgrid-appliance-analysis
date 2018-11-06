import { configure, observable, decorate, flow } from 'mobx'
import Papa from 'papaparse'
import _ from 'lodash'
const csvOptions = { header: true, dynamicTyping: true }
configure({ enforceActions: 'observed' })

const homerPath = './data/homer_12_50_oversize_20.csv'

class MobxStore {
  loading = false
  fetchState = 'pendingggg'
  homer = []
  homerKeyOrder = []

  constructor() {
    this.fetchHomer()
  }

  fetchHomer = flow(function*() {
    console.log('fetching HOMER file')
    this.fetchState = 'loading'
    try {
      const res = yield window.fetch(homerPath)
      const csv = yield res.text()
      const { data, errors } = Papa.parse(csv, csvOptions)
      if (_.isEmpty(errors)) {
        this.homer = _.tail(data)
        this.homerKeyOrder = _.keys(this.homer[0])
        this.fetchState = 'loaded'
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
})

// export default MobxStore
export let mobxStore = new MobxStore()
