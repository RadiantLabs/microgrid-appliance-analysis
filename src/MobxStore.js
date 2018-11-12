import _ from 'lodash'
import {
  configure,
  observable,
  decorate,
  action,
  runInAction,
  computed,
} from 'mobx'
import { fetchFile, getHomerStats, getSummaryStats } from './utils/store'
import { calculateNewLoads } from './utils/loads'
import { mergeTables } from './utils/general'
import { homerFiles, applianceFiles } from './utils/fileInfo'
configure({ enforceActions: 'observed' })

class MobxStore {
  constructor() {
    this.fetchHomer(homerFiles[0])
    this.fetchAppliance(applianceFiles[0])
  }

  activeHomer = null
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

  async fetchHomer(fileInfo) {
    const homer = await fetchFile(fileInfo)
    runInAction(() => (this.activeHomer = homer))
  }

  async fetchAppliance(fileInfo) {
    const appliance = await fetchFile(fileInfo)
    runInAction(() => this.activeAppliances.push(appliance))
  }

  // Form changes
  setActiveHomerFile(event, data) {
    console.log(event)
    console.log(data)
    debugger
  }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeAppliances: observable,
  fetchHomer: action,
  fetchAppliance: action,
  combinedTable: computed,
  homerStats: computed,
  summaryStats: computed,
  setActiveHomerFile: action,
})

export let mobxStore = new MobxStore()
