import _ from 'lodash'
import {
  configure,
  observable,
  decorate,
  action,
  runInAction,
  computed,
  autorun,
} from 'mobx'
import { fetchFile, getHomerStats, getSummaryStats } from './utils/store'
import { calculateNewLoads } from './utils/loads'
import { mergeTables } from './utils/general'
import { homerFiles, applianceFiles } from './utils/fileInfo'
configure({ enforceActions: 'observed' })

// TODO:
// 1. Set active dropdown item based on activeHomerFileInfo
// 2. Fetch appliance based on autorun
class MobxStore {
  constructor() {
    autorun(() => {
      console.log('Fetching new HOMER file: ', this.activeHomerFileInfo.path)
      this.fetchHomer(this.activeHomerFileInfo)
    })
    this.fetchAppliance(applianceFiles[0])
  }

  activeHomer = null
  activeHomerFileInfo = _.find(homerFiles, {
    path: './data/homer/homer_12_50_oversize_20_AS.csv',
  })
  activeAppliances = []

  get combinedTable() {
    if (_.isEmpty(this.activeHomer) || _.isEmpty(this.activeAppliances)) {
      return null
    }
    const mergedTables = mergeTables(
      this.activeHomer.tableData,
      this.activeAppliances[0].tableData
    )
    return calculateNewLoads({
      table: mergedTables,
      fields: null,
      homerStats: this.homerStats,
      constants: {},
    })
  }

  get homerStats() {
    return _.isEmpty(this.activeHomer) ? null : getHomerStats(this.activeHomer)
  }

  get summaryStats() {
    return _.isEmpty(this.combinedTable)
      ? null
      : getSummaryStats(this.combinedTable)
  }

  async fetchHomer(activeHomerFileInfo) {
    const homer = await fetchFile(activeHomerFileInfo)
    runInAction(() => (this.activeHomer = homer))
  }

  async fetchAppliance(fileInfo) {
    const appliance = await fetchFile(fileInfo)
    runInAction(() => this.activeAppliances.push(appliance))
  }

  // Form changes
  setActiveHomerFile(event, data) {
    this.activeHomerFileInfo = _.find(homerFiles, {
      path: data.value,
    })
  }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeHomerFileInfo: observable,
  activeAppliances: observable,
  fetchHomer: action,
  fetchAppliance: action,
  combinedTable: computed,
  homerStats: computed,
  summaryStats: computed,
  setActiveHomerFile: action.bound,
})

export let mobxStore = new MobxStore()
