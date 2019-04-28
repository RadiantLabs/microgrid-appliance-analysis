import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, getSnapshot, applySnapshot, destroy } from 'mobx-state-tree'
import { keepAlive } from 'mobx-utils'
import { RouterModel } from 'mst-react-router'
import localforage from 'localforage'

// Import Other Stores:
import { getInitialState, getUserInfo, history } from './initialize'
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'

// Import Helpers and domain data
import { combineTables } from '../utils/helpers'
import { calcSummaryStats } from '../utils/calcSummaryStats'
import { calcTimeSegments } from '../utils/calcTimeSegments'
import { calcHybridColumns } from '../utils/calcHybridColumns'
import { sumApplianceColumns } from '../utils/sumApplianceColumns'
import { calcMaxApplianceLoad } from '../utils/calcMaxApplianceLoad'
import { calcEnabledApplianceLabels } from '../utils/calcEnabledApplianceLabels'
import { calcAncillaryApplianceLabels } from '../utils/calcAncillaryApplianceLabels'
import { filterCombinedTableHeaders } from '../utils/filterCombinedTableHeaders'
import { combinedColumnHeaderOrder } from '../utils/columnHeaders'
import { ancillaryEquipmentList } from '../utils/fileInfo'
import { loggerConfig } from '../utils/loggerConfig'
import {
  timeSegmentsMetrics,
  timeSegmentsAggregations,
  timeSegmentsBy,
  calcTimeSegmentGroups,
} from '../utils/calcTimeSegments'
// import { logger } from '../utils/logger'

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
    // List of all available grids. Mostly we use `activeGrid` which is
    // identified as a computed view by isActive field on the grid model
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

    // Time Segments chart view variables
    timeSegmentsMetric: types.enumeration('timeSegmentsMetric', timeSegmentsMetrics),
    timeSegmentsAggregation: types.maybeNull(
      types.enumeration('timeSegmentsAggregation', timeSegmentsAggregations)
    ),
    timeSegmentsBy: types.maybeNull(types.enumeration('timeSegmentsBy', timeSegmentsBy)),

    // Filter out columns in the Data table UI
    excludedTableColumns: types.optional(types.array(types.string), []),

    // Link React Router to mobx-state-tree
    router: RouterModel,

    appIsSaved: types.boolean,
    appIsSavedTimestamp: types.maybeNull(types.Date),
    fileImportWarningIsActive: types.maybeNull(types.boolean),

    userName: types.maybeNull(types.string),
    userEmail: types.maybeNull(types.string),
  })
  .actions(self => ({
    afterCreate() {
      self.initializeMainStore()
    },

    initializeMainStore: flow(function* initializeMainStore() {
      const { initialState, isFreshState } = yield getInitialState()
      applySnapshot(self, initialState)
      if (isFreshState) {
        self.loadAvailableGrids()
        self.loadAppliances()
      }
      const { userName, userEmail } = yield getUserInfo()
      self.userName = userName
      self.userEmail = userEmail
      loggerConfig('init')
      loggerConfig('user', { userName: self.userName, userEmail: self.userEmail })
    }),

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
    // -- Time Segment Actions
    // -------------------------------------------------------------------------
    handleTimeSegmentsMetricChange(e, { value }) {
      self.timeSegmentsMetric = value
    },

    handleTimeSegmentsAggregationChange(e, { value }) {
      self.timeSegmentsAggregation = value
    },

    handleTimeSegmentsByChange(e, { value }) {
      self.timeSegmentsBy = value
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

    createStagedAppliance() {
      self.stagedAppliance = ApplianceStore.create(initialApplianceState)
    },

    cancelStagedAppliance() {
      destroy(self.stagedAppliance)
      self.viewedApplianceId = null
    },

    saveStagedAppliance() {
      const stagedApplianceId = self.stagedAppliance.fileInfo.id
      const stagedApplianceSnapshot = getSnapshot(self.stagedAppliance)
      destroy(self.stagedAppliance)
      self.appliances.push(ApplianceStore.create(stagedApplianceSnapshot))
      self.viewedApplianceId = stagedApplianceId
      self.saveAppState()
    },

    deleteApplianceFile(applianceId) {
      const applianceToDelete = _.find(self.appliances, appliance => {
        return appliance.fileInfo.id === applianceId
      })
      const undeletedAppliances = _.filter(self.appliances, appliance => {
        return appliance.fileInfo.id !== applianceId
      })
      const newViewedApplianceId = undeletedAppliances[0].fileInfo.id
      runInAction(() => {
        self.viewedApplianceId = newViewedApplianceId
        destroy(applianceToDelete)
      })
      self.saveAppState()
    },

    deleteGridFile(gridId) {
      const gridToDelete = _.find(self.availableGrids, grid => {
        return grid.fileInfo.id === gridId
      })
      const undeletedGrids = _.filter(self.availableGrids, grid => {
        return grid.fileInfo.id !== gridId
      })
      // Switch active to first undeleted grid
      const newViewedGridId = undeletedGrids[0].fileInfo.id
      runInAction(() => {
        self.setActiveGridFile(newViewedGridId)
        self.viewedGridId = newViewedGridId
        destroy(gridToDelete)
      })
      self.saveAppState()
    },

    setViewedApplianceId(applianceId) {
      self.viewedApplianceId = applianceId
    },

    openFileImportWarningModal() {
      self.fileImportWarningIsActive = true
    },

    closeFileImportWarningModal() {
      self.fileImportWarningIsActive = false
    },

    handleCardExpansion(toggleState) {
      self.activeGrid.toggleCard(toggleState)
      _.forEach(self.enabledAppliances, appliance => {
        appliance.toggleCard(toggleState)
        _.forEach(appliance.enabledAncillaryEquipment, equip => equip.toggleCard(toggleState))
      })
    },

    // Functions below related to saving the application state to localforage
    setAppSavedState() {
      self.appIsSaved = true
      self.appIsSavedTimestamp = Date.now()
      console.log('app saved')
    },

    // There are no warnings before hitting localforage limits. But you can catch
    // the error. If there is an error saving, cancel the save, throw up a modal
    // and let the user delete other files.
    // Another possible source of errors is chrome has a 127MB hard limit per key/value
    saveAppState() {
      localforage
        .setItem('latest', getSnapshot(self))
        .then(() => self.setAppSavedState(true))
        .catch(e => self.openFileImportWarningModal())
    },

    clearAppState() {
      localforage
        .clear()
        .then(() => {
          self.closeFileImportWarningModal()
          self.refreshApp()
        })
        .catch(err => console.log(err))
    },

    refreshApp() {
      history.push('/')
      // Reload without browser cache so state tree is cleared. If it hasn't been
      // deleted from local storage, then it will bootstrap with new sample files
      window.location.reload(true)
    },

    handleUserInfoChange(e, { name, value }) {
      e.preventDefault()
      self[name] = value
    },

    saveUserInfo(e) {
      e.preventDefault()
      localforage
        .setItem('user', { userName: self.userName, userEmail: self.userEmail })
        .then(() => console.log('saved user data'))
        .catch(e => self.openFileImportWarningModal())
      loggerConfig('user', { userName: self.userName, userEmail: self.userEmail })
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
    get timeSegmentGroups() {
      return calcTimeSegmentGroups(self.combinedTable)
    },
    get timeSegments() {
      return calcTimeSegments(self.combinedTable)
    },
    get filteredCombinedTableHeaders() {
      return filterCombinedTableHeaders(
        self.combinedTable,
        self.excludedTableColumns,
        combinedColumnHeaderOrder
      )
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
      if (_.isEmpty(self.availableGrids)) {
        return null
      }
      return self.viewedGridIsStaged
        ? self.stagedGrid
        : _.find(self.availableGrids, grid => grid.fileInfo.id === self.viewedGridId)
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
// Load this top-level store's initial state. Then after instantiation, check to
// see if there is state stored locally. If so, apply that (applySnapshot),
// otherwise use the initial state from each of these stores.
export const initialMainState = {
  availableGrids: [],
  stagedGrid: null,
  viewedGridId: null,
  appliancesAreLoading: true,
  appliances: [],
  viewedApplianceId: null,
  excludedTableColumns: [],
  timeSegmentsMetric: 'load',
  timeSegmentsAggregation: 'average',
  timeSegmentsBy: 'hourOfDay',
  router: RouterModel.create(),
  appIsSaved: true,
  appIsSavedTimestamp: null,
  fileImportWarningIsActive: false,
  userName: '',
  userEmail: '',
}

//
// -----------------------------------------------------------------------------
// Instantiate Primary Store
// -----------------------------------------------------------------------------
// This sets up the root-level store with the defaults from initialMainState and
// no sub-models, such as availableGrids or appliances (just empty arrays of those
// model types). Immediately after MainStore is instantiated, afterCreate() fires
// which calls getInitialState(). This fetches from localforage or if empty,
// uses all of the store initializations to create a fresh state.
// applySnapshot(self, initialState) methodically merges that fresh or saved state
// into this skeleton mainStore instantiated below.

// keepAlive and autorun still works, because it will observe values once they
// get filled in with the saved or fresh state
let mainStore = MainStore.create(initialMainState)
window.mainStore = mainStore // inspect the store in console for debugging

//
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

//
// -----------------------------------------------------------------------------
// Watch for snapshot changes
// -----------------------------------------------------------------------------
// onSnapshot(mainStore, snapshot => {
// })

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

export { mainStore }
