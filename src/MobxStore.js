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
import { fieldDefinitions } from './utils/fieldDefinitions'
configure({ enforceActions: 'observed' })

const initHomerPath = './data/homer/12-50 Baseline.csv'
const initAppliancePath = './data/appliances/rice_mill_usage_profile.csv'

class MobxStore {
  constructor() {
    autorun(() => this.fetchHomer(this.activeHomerFileInfo))
    autorun(() => this.fetchAppliance(this.activeApplianceFileInfo))
  }

  activeHomer = null
  activeAppliance = null
  activeHomerFileInfo = _.find(homerFiles, { path: initHomerPath })
  activeApplianceFileInfo = _.find(applianceFiles, { path: initAppliancePath })
  homerIsLoading = false
  applianceIsLoading = false

  modelInputs = {
    kwFactorToKw: fieldDefinitions['kwFactorToKw'].defaultValue,
  }

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
      modelInputs: this.modelInputs,
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
    this.homerIsLoading = true
    const homer = await fetchFile(activeHomerFileInfo)
    runInAction(() => {
      this.activeHomer = homer
      this.homerIsLoading = false
    })
  }

  async fetchAppliance(fileInfo) {
    this.applianceIsLoading = true
    const appliance = await fetchFile(fileInfo)
    runInAction(() => {
      this.activeAppliance = appliance
      this.applianceIsLoading = false
    })
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

  // Model Input form change handlers
  onModelInputChange(fieldKey, value) {
    this.modelInputs[fieldKey] = value
  }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeHomerFileInfo: observable,
  activeAppliance: observable,
  activeApplianceFileInfo: observable,
  homerIsLoading: observable,
  applianceIsLoading: observable,
  modelInputs: observable,
  fetchHomer: action,
  fetchAppliance: action,
  combinedTable: computed,
  homerStats: computed,
  summaryStats: computed,
  setActiveHomerFile: action.bound,
  setActiveApplianceFile: action.bound,
  onModelInputChange: action.bound,
})

export let mobxStore = new MobxStore()
