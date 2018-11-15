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
  appCalculating = false

  // Model inputs must have a definition in the fieldDefinitions file
  modelInputs = {
    kwFactorToKw: fieldDefinitions['kwFactorToKw'].defaultValue,
    dutyCycleDerateFactor: _.get(
      this.activeApplianceFileInfo,
      'defaults.dutyCycleDerateFactor',
      1
    ),
    seasonalDerateFactor: null,
    wholesaleElectricityCost: 5,
    unmetLoadCostPerKwh: 6,
    retailElectricityPrice: 8,
    productionToThroughput: 1,
    throughputToRevenue: 2,
    throughputToRevenueUnits: '$ / kg of grain',
  }

  // Make sure to clone tables being passed in otherwise mergeTables will mutate
  // the observable arrays and generate this error:
  // > [mobx] Computed values are not allowed to cause side effects by changing
  // > observables that are already being observed
  // With cloneDeep it runs in ~1000ms instead of 330ms, but better than 18 seconds
  get combinedTable() {
    if (_.isEmpty(this.activeHomer) || _.isEmpty(this.activeAppliance)) {
      return null
    }
    // this.appCalculating = true
    const t0 = performance.now()
    const mergedTables = mergeTables(
      _.cloneDeep(this.activeHomer.tableData),
      _.cloneDeep(this.activeAppliance.tableData)
    )
    const t1 = performance.now()
    console.log('mergeTables took ' + _.round(t1 - t0) + ' milliseconds.')
    const calculatedNewLoads = calculateNewLoads({
      table: mergedTables,
      modelInputs: this.modelInputs,
      homerStats: this.homerStats,
      constants: {},
    })
    // this.appCalculating = false
    return calculatedNewLoads
  }

  get homerStats() {
    return _.isEmpty(this.activeHomer) ? null : getHomerStats(this.activeHomer)
  }

  get summaryStats() {
    return _.isEmpty(this.combinedTable)
      ? null
      : getSummaryStats(this.combinedTable, this.modelInputs)
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
  // appCalculating: observable,
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
