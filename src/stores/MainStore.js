import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, onSnapshot, getSnapshot, destroy } from 'mobx-state-tree'
import { keepAlive } from 'mobx-utils'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import { createBrowserHistory } from 'history'
import localforage from 'localforage'

// Import Other Stores:
import { AncillaryEquipmentStore } from './AncillaryEquipmentStore'
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'

// Import Helpers and domain data
import { combineTables } from '../utils/helpers'
import { calcSummaryStats } from '../utils/calcSummaryStats'
import { calcHybridColumns } from '../utils/calcHybridColumns'
// import { predictBatteryEnergyContent } from '../utils/tensorflowHelpers'
import { sumApplianceColumns } from '../utils/sumApplianceColumns'
import { combinedColumnHeaderOrder } from '../utils/columnHeaders'
import { disableAllAncillaryEquipment } from '../utils/ancillaryEquipmentRules'
import {
  sampleGridFileInfos,
  sampleApplianceFiles,
  ancillaryEquipmentList,
} from '../utils/fileInfo'

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
    ancillaryEquipment: AncillaryEquipmentStore,
    router: RouterModel,
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
      // Train battery models if they haven't run yet
      // for (let grid of self.availableGrids) {
      //   if (_.isEmpty(grid.batteryModel)) {
      //     const {
      //       batteryFeatureCount,
      //       batteryTensors,
      //       batteryLearningRate,
      //       batteryBatchSize,
      //       batteryMaxEpochCount,
      //     } = grid
      //     yield grid.trainBatteryModel({
      //       batteryFeatureCount,
      //       batteryTensors,
      //       batteryLearningRate,
      //       batteryBatchSize,
      //       batteryMaxEpochCount,
      //     })
      //   }
      // }
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
    },

    setViewedApplianceId(applianceId) {
      self.viewedApplianceId = applianceId
    },

    // -------------------------------------------------------------------------
    // -- Store history undo
    // -------------------------------------------------------------------------
    saveSnapshot() {
      const snapshot = _.omit(getSnapshot(self), ['grid'])
      console.log('snapshot: ', snapshot)
      // localStorage.setItem('microgridAppliances_testing', JSON.stringify(snapshot))
      localforage.setItem('microgridAppliances_testing', snapshot).then(() => {
        console.log('value set')
      })
    },
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
    get enabledApplianceLabels() {
      const labels = _.map(self.enabledAppliances, appliance => appliance.label)
      const labelCount = _.size(labels)
      if (labelCount === 0) {
        return 'No Appliances Selected'
      }
      if (labelCount > 2) {
        return `${labelCount} Appliances Selected`
      }
      return labels.join(', ')
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
const applianceFileInfos = sampleApplianceFiles.concat([]) // TODO: concat fileInfos from localforage

// Initially set all ancillary equipment to disabled
const initialAncillaryEquipmentState = {
  enabledStates: disableAllAncillaryEquipment(ancillaryEquipmentList),
}

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
      enabled: applianceInfo.id === enabledApplianceFileId,
      // enabled: true,
      ...{ ...applianceInfo.attributes },
      ...{ modelInputValues: { ...applianceInfo.attributes } },
      ...{ fileInfo: _.omit(applianceInfo, ['attributes']) },
    })
  }),
  viewedApplianceId: enabledApplianceFileId,
  ancillaryEquipment: AncillaryEquipmentStore.create(initialAncillaryEquipmentState),
  excludedTableColumns: [],
  router: routerModel,
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

// Only load selective pieces of the state for now
if (localStorage.getItem('microgridAppliances_excludedTableColumns')) {
  const excludedTableColumns = JSON.parse(
    localStorage.getItem('microgridAppliances_excludedTableColumns')
  )
  initialMainState = { ...initialMainState, ...{ excludedTableColumns } }
}

// -----------------------------------------------------------------------------
// Instantiate Primary Store
// -----------------------------------------------------------------------------
let mainStore = MainStore.create(initialMainState)
window.mainStore = mainStore // inspect the store in console for debugging

// -----------------------------------------------------------------------------
// keepAlivve
// -----------------------------------------------------------------------------
// Keep computed views alive even when they aren't being observed so they still
// stay up-to-date but not disposed of when they aren't observed anymore
keepAlive(mainStore, 'activeGrid')
_.forEach(mainStore.appliances, appliance => {
  keepAlive(appliance, 'calculatedApplianceColumns')
  keepAlive(appliance, 'applianceSummaryStats')
})

/**
 * Watch for snapshot changes
 */
onSnapshot(mainStore, snapshot => {
  // localStorage.setItem('microgridAppliances', JSON.stringify(snapshot))
  localStorage.setItem(
    'microgridAppliances_excludedTableColumns',
    JSON.stringify(snapshot.excludedTableColumns)
  )
})

//
// -----------------------------------------------------------------------------
// Autorun: Run functions whenever arguments change
// -----------------------------------------------------------------------------

// Calculate the predicted vs. actual battery values. This was set up as a
// computed view, but it was rerunning when changing the page url. I'm guessing
// this is because the app had stopped observing the results of the computed value
// so mobx cleared the cached values. This runs it only when the inputs to the
// function change
// autorun(() =>
//   mainStore.activeGrid.setBatteryPlottablePredictionVsActualData(
//     mainStore.activeGrid.batteryTrainingData,
//     mainStore.activeGrid.batteryModel
//   )
// )

// Set Ancillary Equipment enabled/disabled status based on if it is required:
autorun(() =>
  mainStore.ancillaryEquipment.setEquipmentEnabledFromStatus(
    mainStore.ancillaryEquipment.equipmentStatus
  )
)

// Run the battery regression model
// autorun(() => {
//   if (_.isEmpty(mainStore.activeGrid)) {
//     return null
//   }
//   const {
//     batteryFeatureCount,
//     batteryTensors,
//     batteryLearningRate,
//     batteryBatchSize,
//     batteryMaxEpochCount,
//   } = mainStore.activeGrid
//   mainStore.activeGrid.trainBatteryModel({
//     batteryFeatureCount,
//     batteryTensors,
//     batteryLearningRate,
//     batteryBatchSize,
//     batteryMaxEpochCount,
//   })
// })

// autorun(() => {
//   if (_.isEmpty(mainStore.stagedGrid)) {
//     return null
//   }
//   const {
//     batteryFeatureCount,
//     batteryTensors,
//     batteryLearningRate,
//     batteryBatchSize,
//     batteryMaxEpochCount,
//   } = mainStore.stagedGrid
//   mainStore.stagedGrid.trainBatteryModel({
//     batteryFeatureCount,
//     batteryTensors,
//     batteryLearningRate,
//     batteryBatchSize,
//     batteryMaxEpochCount,
//   })
// })

export { mainStore, history }
