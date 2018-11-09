import _ from 'lodash'
import {
  configure,
  observable,
  decorate,
  action,
  runInAction,
  computed,
} from 'mobx'
import { fetchFile, calculateHomerStats, calculateNewLoads } from './storeUtils'
import { mergeTables } from './utils'
import { homerFiles, applianceFiles } from './fileInfo'
configure({ enforceActions: 'observed' })

class MobxStore {
  activeHomer = null
  activeAppliances = []

  constructor() {
    this.fetchHomer(homerFiles[0])
    this.fetchAppliance(applianceFiles[0])
  }

  get combinedTable() {
    if (_.isEmpty(this.activeHomer) || _.isEmpty(this.activeAppliances)) {
      return null
    }
    const mergedTables = mergeTables(
      this.activeHomer.tableData,
      this.activeAppliances[0].tableData
    )

    const newLoadColumns = calculateNewLoads(mergedTables)
    console.log('newLoadColumns')
    return mergedTables
  }

  get cachedHomerStats() {
    return _.isEmpty(this.activeHomer)
      ? {}
      : calculateHomerStats(this.activeHomer)
  }

  async fetchHomer(fileInfo) {
    const homer = await fetchFile(fileInfo)
    runInAction(() => (this.activeHomer = homer))
  }

  async fetchAppliance(fileInfo) {
    const appliance = await fetchFile(fileInfo)
    runInAction(() => this.activeAppliances.push(appliance))
  }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeAppliances: observable,
  fetchHomer: action,
  fetchAppliance: action,
  combinedTable: computed,
  cachedHomerStats: computed,
})

export let mobxStore = new MobxStore()
