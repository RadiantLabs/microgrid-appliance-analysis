import _ from 'lodash'
import {
  configure,
  observable,
  decorate,
  action,
  runInAction,
  computed,
} from 'mobx'
import { fetchFile, calculateHomerStats } from './utils/store'
import { calculateNewLoads } from './utils/loads'
import { mergeTables } from './utils/general'
import { homerFiles, applianceFiles } from './utils/fileInfo'
import { constants } from './utils/constants'
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

    const withNewLoadColumns = calculateNewLoads({
      table: mergedTables,
      fields: null,
      tableStats: this.cachedHomerStats,
      constants: constants,
    })
    console.log('withNewLoadColumns: ', withNewLoadColumns)
    return withNewLoadColumns
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
