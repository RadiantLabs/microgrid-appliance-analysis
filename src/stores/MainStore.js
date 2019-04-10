import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, onSnapshot, getSnapshot, destroy } from 'mobx-state-tree'
import { keepAlive } from 'mobx-utils'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import { createBrowserHistory } from 'history'
import localforage from 'localforage'
import moment from 'moment'

// Import Other Stores:
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'
import { AncillaryEquipmentStore, initialAncillaryEquipmentState } from './AncillaryEquipmentStore'

// Import Helpers and domain data
import { combineTables } from '../utils/helpers'
import { calcSummaryStats } from '../utils/calcSummaryStats'
import { calcHybridColumns } from '../utils/calcHybridColumns'
import { sumApplianceColumns } from '../utils/sumApplianceColumns'
import { calcMaxApplianceLoad } from '../utils/calcMaxApplianceLoad'
import { calcEnabledApplianceLabels } from '../utils/calcEnabledApplianceLabels'
import { calcAncillaryApplianceLabels } from '../utils/calcAncillaryApplianceLabels'
import { combinedColumnHeaderOrder } from '../utils/columnHeaders'
import {
  sampleGridFileInfos,
  sampleApplianceFiles,
  ancillaryEquipmentList,
} from '../utils/fileInfo'

window.moment = moment

// -----------------------------------------------------------------------------
// Configure local forage
// -----------------------------------------------------------------------------
localforage.config({
  name: 'factore_microgrid_analysis_tool',
  storeName: 'savedState',
})

//
// -----------------------------------------------------------------------------
// Primary Store
// -----------------------------------------------------------------------------
export const MainStore = types
  .model({
    // Homer Data
    // List of all available grids. The app doesn't use this directly - it uses
    // a computted view of the `activeGrid` and `inactiveGrids`, identified by
    // isActive on the grid model
    availableGrids: types.optional(types.array(GridStore), []),

    // For uploading and viewing different HOMER files
    stagedGrid: types.maybeNull(GridStore),
    viewedGridId: types.maybeNull(types.string),

    // Appliance Info
    appliancesAreLoading: types.boolean,
    appliances: types.optional(types.array(ApplianceStore), []),

    // For uploading and viewing different appliance files
    stagedAppliance: types.maybeNull(ApplianceStore),
    viewedApplianceId: types.maybeNull(types.string),

    excludedTableColumns: types.optional(types.array(types.string), []),
    router: RouterModel,

    appIsSaved: types.boolean,
    appIsSavedTimestamp: types.Date,
  })
  .actions(self => ({
    afterCreate() {
      // self.loadActiveGrid() // will call loadAvailableGrids() after activeGrid loads
      self.loadAvailableGrids()
      self.loadAppliances()
    },

    loadActiveGrid: flow(function* loadActiveGrid() {
      self.activeGridIsLoading = true
      yield self.activeGrid.loadFile(self.activeGrid.fileInfo)
      self.activeGridIsLoading = false
      self.loadAvailableGrids() // Temp disable to speed up development
    }),

    // All availableGrids will be instantiated GridStores with barely any data
    // Load data and run battery model of all grids (sample and user)
    // This may be hard on user's memory. We can turn this off if it's a problem
    // Needs to be in a for...of loop so it's an async, sequential function calls
    loadAvailableGrids: flow(function* loadAvailableGrids() {
      for (let grid of self.availableGrids) {
        yield grid.loadFile(grid.fileInfo)
      }
    }),

    // All of these availableGrids will be instantiated GridStores with barely any data
    loadAppliances: flow(function* loadAppliances() {
      self.appliancesAreLoading = true
      for (let appliance of self.appliances) {
        yield appliance.loadFile(appliance.fileInfo)
      }
      self.appliancesAreLoading = false
    }),

    setActiveGridFile(fileId) {
      runInAction(() => {
        self.availableGrids.forEach(grid => {
          grid.isActive = grid.fileInfo.id === fileId
        })
      })
    },

    setExcludedTableColumns(columnName) {
      if (_.includes(self.excludedTableColumns, columnName)) {
        self.excludedTableColumns = _.without(self.excludedTableColumns, columnName)
      } else {
        self.excludedTableColumns.push(columnName)
      }
      self.saveAppState()
    },

    // -------------------------------------------------------------------------
    // -- Upload HOMER and Appliance Files
    // -------------------------------------------------------------------------
    // gridId is a unique string based on the filename and timestamp.
    // It will be 'staged' if it's a file that is temporarily being uploaded
    setViewedGridId(gridId) {
      self.viewedGridId = gridId
    },

    createStagedGrid() {
      self.stagedGrid = GridStore.create(initialGridState)
    },

    cancelStagedGrid() {
      destroy(self.stagedGrid)
      self.viewedGridId = null
    },

    saveStagedGrid() {
      const stagedGridId = self.stagedGrid.fileInfo.id
      const stagedGridSnapshot = getSnapshot(self.stagedGrid)
      destroy(self.stagedGrid)
      self.availableGrids.push(GridStore.create(stagedGridSnapshot))
      self.viewedGridId = stagedGridId
      self.setActiveGridFile(stagedGridId)
      self.saveAppState()
    },

    setViewedApplianceId(applianceId) {
      self.viewedApplianceId = applianceId
    },

    setAppSavedState() {
      self.appIsSaved = true
      self.appIsSavedTimestamp = Date.now()
      console.log('app saved')
    },

    saveAppState() {
      localforage.setItem('latest', getSnapshot(self)).then(() => {
        self.setAppSavedState(true)
      })
    },

    // Store history undo, WIP
    // saveSnapshot() {
    //   const snapshot = _.omit(getSnapshot(self), ['grid'])
    //   console.log('snapshot: ', snapshot)
    //   // localStorage.setItem('microgridAppliances_testing', JSON.stringify(snapshot))
    //   localforage.setItem('microgridAppliances_testing', snapshot).then(() => {
    //     console.log('value set')
    //   })
    // },
  }))
  .views(self => ({
    get activeGrid() {
      return _.find(self.availableGrids, grid => grid.isActive)
    },
    get inActiveGrids() {
      return _.filter(self.availableGrids, grid => !grid.isActive)
    },
    get summedApplianceColumns() {
      return sumApplianceColumns(self.enabledAppliances)
    },
    get hybridColumns() {
      return calcHybridColumns(self.activeGrid, self.summedApplianceColumns)
    },
    get combinedTable() {
      return combineTables(
        self.activeGrid.fileData,
        self.summedApplianceColumns,
        self.hybridColumns
      )
    },
    get summaryStats() {
      return calcSummaryStats(self.activeGrid, self.combinedTable, self.enabledAppliances)
    },
    get filteredCombinedTableHeaders() {
      return _.filter(combinedColumnHeaderOrder, header => {
        return !_.includes(self.excludedTableColumns, header)
      })
    },
    get percentTableColumnsShowing() {
      return _.round(
        (_.size(self.filteredCombinedTableHeaders) / _.size(combinedColumnHeaderOrder)) * 100
      )
    },
    get viewedGridIsStaged() {
      return self.viewedGridId === 'staged'
    },
    get viewedGrid() {
      return self.viewedGridIsStaged
        ? self.stagedGrid
        : _.find(
            self.availableGrids.concat(self.activeGrid),
            grid => grid.fileInfo.id === self.viewedGridId
          )
    },
    get viewedApplianceIsStaged() {
      return self.viewedApplianceId === 'staged'
    },
    get viewedAppliance() {
      return self.viewedApplianceIsStaged
        ? self.stagedAppliance
        : _.find(self.appliances, appliance => appliance.fileInfo.id === self.viewedApplianceId)
    },
    get enabledAppliances() {
      return _.filter(self.appliances, appliance => appliance.enabled)
    },
    get multipleAppliancesEnabled() {
      return _.size(self.enabledAppliances) > 1
    },
    get noAppliancesEnabled() {
      return _.size(self.enabledAppliances) === 0
    },
    get enabledApplianceLabels() {
      return calcEnabledApplianceLabels(self.enabledAppliances)
    },
    get ancillaryEquipmentLabels() {
      return calcAncillaryApplianceLabels(self.enabledAppliances)
    },
    get maxApplianceLoad() {
      return calcMaxApplianceLoad(self.combinedTable)
    },
  }))

//
// -----------------------------------------------------------------------------
// Initialize Mobx State Tree Store
// -----------------------------------------------------------------------------
//Hook React Router up to Store
const routerModel = RouterModel.create()
//Hook up router model to browser history object
const history = syncHistoryWithStore(createBrowserHistory(), routerModel)

const initGridFileId = '12-50 Oversize 20_2019-02-16T20:34:25.937-07:00' // TODO: Check localforage
const allGridFileInfos = sampleGridFileInfos.concat([]) // TODO: concat fileInfos from localforage
const enabledApplianceFileId = 'rice_mill_usage_profile_2019-02-16T20:33:55.583-07:00' // TODO: Check localforage
// const enabledApplianceFileId = 'maize_mill_usage_profile_1_20_2019-02-16T20:34:25.937-07:00'

const applianceFileInfos = sampleApplianceFiles.concat([]) // TODO: concat fileInfos from localforage

let initialMainState = {
  availableGrids: _.map(allGridFileInfos, gridInfo => {
    return GridStore.create({
      ...initialGridState,
      ...{ isActive: gridInfo.id === initGridFileId },
      ...{ ...gridInfo.attributes },
      ...{ modelInputValues: { ...gridInfo.attributes } },
      ...{ fileInfo: _.omit(gridInfo, ['attributes']) },
    })
  }),
  stagedGrid: null,
  viewedGridId: initGridFileId,
  appliancesAreLoading: true,
  appliances: _.map(applianceFileInfos, applianceInfo => {
    return ApplianceStore.create({
      ...initialApplianceState,

      // enabled: applianceInfo.id === enabledApplianceFileId,
      enabled: true, // for debugging

      ...{ applianceType: applianceInfo.applianceType },
      ...{ ...applianceInfo.attributes },
      ...{ modelInputValues: { ...applianceInfo.attributes } },
      ...{ fileInfo: _.omit(applianceInfo, ['attributes']) },
      ...{
        ancillaryEquipment: _.map(ancillaryEquipmentList, ancillaryEquip => {
          return AncillaryEquipmentStore.create({
            ...ancillaryEquip,
            ...initialAncillaryEquipmentState,
          })
        }),
      },
    })
  }),
  viewedApplianceId: enabledApplianceFileId,
  excludedTableColumns: [],
  router: routerModel,
  appIsSaved: true,
  appIsSavedTimestamp: Date.now(),
}

//
// -----------------------------------------------------------------------------
// Store state snapshots in localForage
// -----------------------------------------------------------------------------

// Load entire state fromm local storage as long as the model shape are this same
// This allows the developer to modify the model and get a fresh state
// if (localStorage.getItem('microgridAppliances')) {
//   const json = JSON.parse(localStorage.getItem('microgridAppliances'))
//   if (MainStore.is(json)) {
//     initialMainState = json
//   }
// }

// -----------------------------------------------------------------------------
// Instantiate Primary Store
// -----------------------------------------------------------------------------
let mainStore = MainStore.create(initialMainState)
window.mainStore = mainStore // inspect the store in console for debugging

// -----------------------------------------------------------------------------
// keepAlive computed values (views)
// -----------------------------------------------------------------------------
// Keep computed views alive even when they aren't being observed so they still
// stay up-to-date but not disposed of when they aren't observed anymore
keepAlive(mainStore, 'activeGrid')
_.forEach(mainStore.appliances, appliance => {
  keepAlive(appliance, 'calculatedApplianceColumns')
  keepAlive(appliance, 'applianceSummaryStats')
})

// -----------------------------------------------------------------------------
// Watch for snapshot changes
// -----------------------------------------------------------------------------
onSnapshot(mainStore, snapshot => {
  // localStorage.setItem('microgridAppliances', JSON.stringify(snapshot))
  // localStorage.setItem(
  //   'microgridAppliances_excludedTableColumns',
  //   JSON.stringify(snapshot.excludedTableColumns)
  // )
  // mainStore.setAppSavedState(false)
})

//
// -----------------------------------------------------------------------------
// Autorun: Run functions whenever arguments change
// -----------------------------------------------------------------------------
// Keep all autoruns here so they aren't spread out everywhere

// Based on the activeGrid and the appliance characteristics, set values such as
// compatibility (required, useful, notuseful), estimated cost, efficiency, ...
// From those, set defaults such as enabled.
// We need high-resolution arguments so this function runs anytime they change.
autorun(() => {
  if (_.isEmpty(mainStore.activeGrid) || _.isEmpty(mainStore.appliances)) {
    return null
  }
  mainStore.appliances.forEach(appliance => {
    appliance.ancillaryEquipment.forEach(equip => {
      equip.updateValues({
        equipmentType: equip.equipmentType,
        gridPowerType: mainStore.activeGrid.powerType,
        applPowerType: appliance.powerType,
        applHasMotor: appliance.hasMotor,
        applPhase: appliance.phase,
        applPowerFactor: appliance.powerFactor,
        applSize: appliance.nominalPower,
        ancillaryEquipmentList,
      })
    })
  })
})

export { mainStore, history }
