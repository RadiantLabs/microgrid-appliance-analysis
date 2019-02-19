import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import localforage from 'localforage'

// Import Other Stores:
import { ModelInputsStore } from './ModelInputsStore'
import { AncillaryEquipmentStore } from './AncillaryEquipmentStore'
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'

// Import Helpers and domain data
import { combineTables } from 'utils/helpers'
import { getSummaryStats } from 'utils/calculateStats'
import { calculateNewColumns } from 'utils/calculateNewColumns'
import { sampleGridFileInfos, sampleApplianceFiles, ancillaryEquipmentList } from 'utils/fileInfo'
import { fieldDefinitions } from 'utils/fieldDefinitions'
import { combinedColumnHeaderOrder } from 'utils/columnHeaders'
import { disableAllAncillaryEquipment } from 'utils/ancillaryEquipmentRules'

//
// -----------------------------------------------------------------------------
// Primary Store
// -----------------------------------------------------------------------------
export const MainStore = types
  .model({
    // Homer Data
    activeGrid: types.maybeNull(GridStore),
    activeGridIsLoading: types.boolean,
    stagedGrid: types.maybeNull(GridStore),
    availableGrids: types.optional(types.array(GridStore), []),

    // Appliance Info
    activeAppliance: types.maybeNull(ApplianceStore),
    activeApplianceIsLoading: types.boolean,
    stagedAppliance: types.maybeNull(ApplianceStore),
    availableAppliances: types.optional(types.array(ApplianceStore), []),

    excludedTableColumns: types.optional(types.array(types.string), []),
    modelInputs: ModelInputsStore,
    ancillaryEquipment: AncillaryEquipmentStore,
    router: RouterModel,
  })
  .actions(self => ({
    afterCreate() {
      // load data and run battery model of all grids (sample and user)
      // This may be hard on user's memory. We can turn this off if it's a problem
      self.loadAvailableGrids()
      self.loadAvailableAppliances()
    },

    fetchActiveGrid: flow(function* fetchActiveGrid(fileInfo) {
      console.log('running fetchActiveGrid')
      self.activeGridIsLoading = true
      yield self.activeGrid.loadFile(fileInfo)
      self.activeGridIsLoading = false
    }),

    fetchActiveAppliance: flow(function* fetchActiveAppliance(fileInfo) {
      self.activeApplianceIsLoading = true
      yield self.activeAppliance.loadFile(fileInfo)
      self.activeApplianceIsLoading = false
    }),

    // All of these availableGrids will be instantiated GridStores with barely any data
    loadAvailableGrids: flow(function* loadAvailableGrids() {
      for (let grid of self.availableGrids) {
        yield grid.loadFile(grid.fileInfo)
      }
    }),

    // All of these availableGrids will be instantiated GridStores with barely any data
    loadAvailableAppliances: flow(function* loadAvailableAppliances() {
      for (let appliance of self.availableAppliances) {
        yield appliance.loadFile(appliance.fileInfo)
      }
    }),

    setActiveGridFile(event, data) {
      const selectedGridIndex = _.findIndex(self.availableGrids, grid => {
        return grid.fileInfo.id === data.value
      })
      // Cannot have the same instance of a grid assigned to two places at once
      // runInAction keeps actions within a transaction
      // TODO Next: run models sequentially: grid.loadGridFile();
      runInAction(() => {
        const activeGridSnapshot = getSnapshot(self.activeGrid)
        const selectedGridSnapshot = getSnapshot(self.availableGrids[selectedGridIndex])
        applySnapshot(self.availableGrids[selectedGridIndex], activeGridSnapshot)
        applySnapshot(self.activeGrid, selectedGridSnapshot)
      })
    },

    setActiveApplianceFile(event, data) {
      const selectedApplianceIndex = _.findIndex(self.availableAppliances, appliance => {
        return appliance.fileInfo.id === data.value
      })
      runInAction(() => {
        const activeApplianceSnapshot = getSnapshot(self.activeAppliance)
        const selectedApplianceSnapshot = getSnapshot(
          self.availableAppliances[selectedApplianceIndex]
        )
        applySnapshot(self.availableAppliances[selectedApplianceIndex], activeApplianceSnapshot)
        applySnapshot(self.activeAppliance, selectedApplianceSnapshot)
      })
    },

    setExcludedTableColumns(columnName) {
      if (_.includes(self.excludedTableColumns, columnName)) {
        self.excludedTableColumns = _.without(self.excludedTableColumns, columnName)
      } else {
        self.excludedTableColumns.push(columnName)
      }
    },

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

// TODO: pull out label and description from sample fileInfo. Set it here:
// const activeApplianceLabel = _.get(activeApplianceFileInfo, 'fileLabel', '')
// _.remove(activeApplianceFileInfo, 'fileLabel')
// Or keep label and description in a separate object
const initApplianceFileId = 'rice_mill_usage_profile_2019-02-16T20:33:55.583-07:00' // TODO: Check localforage
const allApplianceFileInfos = sampleApplianceFiles.concat([]) // TODO: concat fileInfos from localforage
const activeApplianceFileInfo = _.find(allApplianceFileInfos, { id: initApplianceFileId })
const availableApplianceFileInfos = _.filter(
  allApplianceFileInfos,
  info => info.id !== activeApplianceFileInfo.id
)

// Model inputs must have a definition in the fieldDefinitions file
const initialModelInputsState = {
  applianceNominalPower: fieldDefinitions['applianceNominalPower'].defaultValue,
  dutyCycleDerateFactor: _.get(activeApplianceFileInfo, 'defaults.dutyCycleDerateFactor', 1),
  seasonalDerateFactor: null,
  wholesaleElectricityCost: 5,
  unmetLoadCostPerKwh: 6,
  retailElectricityPrice: 8,
  productionUnitsPerKwh: 5,
  revenuePerProductionUnits: 2,
  revenuePerProductionUnitsUnits: '$ / kg',
}

// Initially set all ancillary equipment to disabled
const initialAncillaryEquipmentState = {
  enabledStates: disableAllAncillaryEquipment(ancillaryEquipmentList),
}

let initialMainState = {
  activeGrid: GridStore.create({
    ...initialGridState,
    ...{ fileInfo: activeGridFileInfo },
    ...{ fileLabel: activeGridFileInfo.label, fileDescription: activeGridFileInfo.description },
  }),
  activeGridIsLoading: true,
  stagedGrid: null,
  availableGrids: _.map(availableGridFileInfos, gridInfo => {
    return GridStore.create({
      ...initialGridState,
      ...{ fileInfo: gridInfo },
      ...{ fileLabel: gridInfo.label, fileDescription: gridInfo.description },
    })
  }),

  // TODO: remove label and description from activeApplianceFileInfo so it isn't
  // stale data.
  activeAppliance: ApplianceStore.create({
    ...initialApplianceState,
    ...{ fileInfo: activeApplianceFileInfo },
    ...{
      fileLabel: activeApplianceFileInfo.label,
      fileDescription: activeApplianceFileInfo.description,
    },
  }),
  activeApplianceIsLoading: true,
  availableAppliances: _.map(availableApplianceFileInfos, applianceInfo => {
    return ApplianceStore.create({
      ...initialApplianceState,
      ...{ fileInfo: applianceInfo },
      ...{ fileLabel: applianceInfo.label, fileDescription: applianceInfo.description },
    })
  }),

  modelInputs: ModelInputsStore.create(initialModelInputsState),
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
autorun(() => mainStore.fetchActiveGrid(mainStore.activeGrid.fileInfo))
autorun(() => mainStore.fetchActiveAppliance(mainStore.activeAppliance.fileInfo))

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
