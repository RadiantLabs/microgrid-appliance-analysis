import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, onSnapshot, getSnapshot, applySnapshot, destroy } from 'mobx-state-tree'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import localforage from 'localforage'

// Import Other Stores:
import { AncillaryEquipmentStore } from './AncillaryEquipmentStore'
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'

// Import Helpers and domain data
import { combineTables } from 'src/utils/helpers'
import { getSummaryStats } from 'src/utils/calculateStats'
import { calculateNewColumns } from 'src/utils/calculateNewColumns'
import {
  sampleGridFileInfos,
  sampleApplianceFiles,
  ancillaryEquipmentList,
} from 'src/utils/fileInfo'
import { combinedColumnHeaderOrder } from 'src/utils/columnHeaders'
import { disableAllAncillaryEquipment } from 'src/utils/ancillaryEquipmentRules'

//
// -----------------------------------------------------------------------------
// Primary Store
// -----------------------------------------------------------------------------
export const MainStore = types
  .model({
    // Homer Data
    activeGrid: types.maybeNull(GridStore),
    activeGridIsLoading: types.boolean,
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
      self.loadActiveGrid() // will call loadAvailableGrids() after activeGrid loads
      self.loadAppliances()
    },

    loadActiveGrid: flow(function* loadActiveGrid() {
      self.activeGridIsLoading = true
      yield self.activeGrid.loadFile(self.activeGrid.fileInfo)
      self.activeGridIsLoading = false
      self.loadAvailableGrids()
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
      for (let grid of self.availableGrids) {
        if (_.isEmpty(grid.batteryModel)) {
          const {
            batteryFeatureCount,
            batteryTensors,
            batteryLearningRate,
            batteryBatchSize,
            batteryMaxEpochCount,
          } = grid
          yield grid.trainBatteryModel({
            batteryFeatureCount,
            batteryTensors,
            batteryLearningRate,
            batteryBatchSize,
            batteryMaxEpochCount,
          })
        }
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
      const selectedGridIndex = _.findIndex(self.availableGrids, grid => {
        return grid.fileInfo.id === fileId
      })
      if (selectedGridIndex === -1) {
        throw new Error(`Could not find grid id in available grids. Looking for ${fileId}`) // TODO: Log this error
      }
      runInAction(() => {
        const activeGridSnapshot = getSnapshot(self.activeGrid)
        const selectedGridSnapshot = getSnapshot(self.availableGrids[selectedGridIndex])
        applySnapshot(self.availableGrids[selectedGridIndex], activeGridSnapshot)
        applySnapshot(self.activeGrid, selectedGridSnapshot)
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
    get calculatedColumns() {
      return calculateNewColumns({
        grid: self.activeGrid,
        appliance: self.activeAppliance,
        modelInputs: self.modelInputs,
      })
    },
    get combinedTable() {
      return combineTables(
        self.activeGrid.fileData,
        self.calculatedColumns,
        self.activeAppliance.fileData
      )
    },
    get summaryStats() {
      return _.isEmpty(self.calculatedColumns)
        ? null
        : getSummaryStats(self.calculatedColumns, self.modelInputs)
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
      const labels = _.map(self.enabledAppliances, appliance => appliance.fileLabel)
      const labelCount = _.size(labels)
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
const activeGridFileInfo = _.find(allGridFileInfos, { id: initGridFileId })
const availableGridFileInfos = _.filter(allGridFileInfos, info => info.id !== activeGridFileInfo.id)

const enabledApplianceFileId = 'rice_mill_usage_profile_2019-02-16T20:33:55.583-07:00' // TODO: Check localforage
const applianceFileInfos = sampleApplianceFiles.concat([]) // TODO: concat fileInfos from localforage

// Initially set all ancillary equipment to disabled
const initialAncillaryEquipmentState = {
  enabledStates: disableAllAncillaryEquipment(ancillaryEquipmentList),
}

let initialMainState = {
  activeGrid: GridStore.create({
    ...initialGridState,
    ...{
      fileLabel: activeGridFileInfo.attributes.label,
      fileDescription: activeGridFileInfo.attributes.description,
    },
    ...{ fileInfo: _.omit(activeGridFileInfo, ['attributes']) },
  }),
  activeGridIsLoading: true,
  availableGrids: _.map(availableGridFileInfos, gridInfo => {
    return GridStore.create({
      ...initialGridState,
      ...{ fileLabel: gridInfo.attributes.label, fileDescription: gridInfo.attributes.description },
      ...{ fileInfo: _.omit(gridInfo, ['attributes']) },
    })
  }),
  stagedGrid: null,
  viewedGridId: initGridFileId,

  appliancesAreLoading: true,
  appliances: _.map(applianceFileInfos, applianceInfo => {
    return ApplianceStore.create({
      ...initialApplianceState,
      ...{
        enabled: applianceInfo.id === enabledApplianceFileId,
        fileLabel: applianceInfo.attributes.label,
        fileDescription: applianceInfo.attributes.description,
        powerType: applianceInfo.attributes.powerType,
        phase: applianceInfo.attributes.phase,
        hasMotor: applianceInfo.attributes.hasMotor,
        powerFactor: applianceInfo.attributes.powerFactor,
      },
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

/**
 * Instantiate Primary Store
 */
let mainStore = MainStore.create(initialMainState)
window.mainStore = mainStore // inspect the store in console for debugging

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

// Set Ancillary Equipment enabled/disabled status based on if it is required:
autorun(() =>
  mainStore.ancillaryEquipment.setEquipmentEnabledFromStatus(
    mainStore.ancillaryEquipment.equipmentStatus
  )
)

// Run the battery regression model
autorun(() => {
  if (_.isEmpty(mainStore.activeGrid)) {
    return null
  }
  const {
    batteryFeatureCount,
    batteryTensors,
    batteryLearningRate,
    batteryBatchSize,
    batteryMaxEpochCount,
  } = mainStore.activeGrid
  mainStore.activeGrid.trainBatteryModel({
    batteryFeatureCount,
    batteryTensors,
    batteryLearningRate,
    batteryBatchSize,
    batteryMaxEpochCount,
  })
})

autorun(() => {
  if (_.isEmpty(mainStore.stagedGrid)) {
    return null
  }
  const {
    batteryFeatureCount,
    batteryTensors,
    batteryLearningRate,
    batteryBatchSize,
    batteryMaxEpochCount,
  } = mainStore.stagedGrid
  mainStore.stagedGrid.trainBatteryModel({
    batteryFeatureCount,
    batteryTensors,
    batteryLearningRate,
    batteryBatchSize,
    batteryMaxEpochCount,
  })
})

export { mainStore, history }
