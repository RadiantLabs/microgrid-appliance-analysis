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

const initHomerPath = './data/homer/homer_12_50_oversize_20_AS.csv'
const initAppliancePath = './data/appliances/sample_mill_usage_profile.csv'

class MobxStore {
  constructor() {
    autorun(() => this.fetchHomer(this.activeHomerFileInfo))
    autorun(() => this.fetchAppliance(this.activeApplianceFileInfo))
  }

  activeHomer = null
  activeAppliance = null
  activeHomerFileInfo = _.find(homerFiles, { path: initHomerPath })
  activeApplianceFileInfo = _.find(applianceFiles, { path: initAppliancePath })

  get combinedTable() {
    if (_.isEmpty(this.activeHomer) || _.isEmpty(this.activeAppliance)) {
      return null
    }
    const mergedTables = mergeTables(
      this.activeHomer.tableData,
      this.activeAppliance.tableData
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
    runInAction(() => (this.activeAppliance = appliance))
  }

  // Choose HOMER or Appliance File Form changes
  setActiveHomerFile(event, data) {
    this.activeHomerFileInfo = _.find(homerFiles, {
      path: data.value,
    })
  }
  setActiveApplianceFile(event, data) {
    this.activeApplianceFileInfo = _.find(applianceFiles, {
      path: data.value,
    })
  }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeHomerFileInfo: observable,
  activeAppliance: observable,
  activeApplianceFileInfo: observable,
  fetchHomer: action,
  fetchAppliance: action,
  combinedTable: computed,
  homerStats: computed,
  summaryStats: computed,
  setActiveHomerFile: action.bound,
  setActiveApplianceFile: action.bound,
})

export let mobxStore = new MobxStore()
