import _ from 'lodash'
import { autorun } from 'mobx'
import { types, flow, onSnapshot, getSnapshot } from 'mobx-state-tree'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import localforage from 'localforage'

// Import Other Stores:
import { ModelInputsStore } from './ModelInputsStore'
import { AncillaryEquipmentStore } from './AncillaryEquipmentStore'
import { GridStore, initialGridState } from './GridStore'

// Import Helpers and domain data
import { combineTables } from 'utils/helpers'
import { fetchFile } from 'utils/importFileHelpers'
import { getSummaryStats } from 'utils/calculateStats'
import { calculateNewLoads } from 'utils/calculateNewColumns'
import { sampleHomerFiles, applianceFiles, ancillaryEquipment } from 'utils/fileInfo'
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
    activeGridInfo: types.frozen(),
    activeGrid: types.maybeNull(GridStore),
    activeGridIsLoading: types.boolean,
    stagedGrid: types.maybeNull(GridStore),
    availableGrids: types.optional(types.array(GridStore), []), // Option 1

    // Appliance Info
    initApplianceFileName: types.string,
    applianceIsLoading: types.boolean,
    activeApplianceFileInfo: types.frozen(),
    activeAppliance: types.frozen(),

    excludedTableColumns: types.optional(types.array(types.string), []),

    // editable fields - may make this an array of ModelInputsStore eventually
    modelInputs: ModelInputsStore,
    ancillaryEquipment: AncillaryEquipmentStore,
    router: RouterModel,
  })
  .actions(self => ({
    fetchActiveGrid: flow(function* fetchActiveGrid(activeGridInfo) {
      self.activeGridIsLoading = true
      yield self.activeGrid.loadGridFile(activeGridInfo)
      self.activeGridIsLoading = false
    }),
    fetchAppliance: flow(function* fetchAppliance(activeApplianceFileInfo) {
      self.applianceIsLoading = true
      self.activeAppliance = yield fetchFile(activeApplianceFileInfo, window.location)
      self.applianceIsLoading = false
    }),
    // loadAvailableGrids: flow(function* loadAvailableGrids() {
    // // All of these availableGrids will be instantiated GridStores with barely any data
    // for (let grid of self.availableGrids) {
    //  await grid.loadGridFile();
    // }
    // }),

    // Choose active HOMER or Appliance file
    setActiveHomerFile(event, data) {
      self.activeGridInfo = _.find(sampleHomerFiles, {
        fileName: data.value,
      })
    },
    setActiveApplianceFile(event, data) {
      self.activeApplianceFileInfo = _.find(applianceFiles, {
        fileName: data.value,
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
      return calculateNewLoads({
        grid: self.activeGrid.fileData,
        appliance: self.activeAppliance,
        modelInputs: self.modelInputs,
        homerStats: self.homerStats,
        constants: {},
      })
    },
    get combinedTable() {
      return combineTables(self.activeGrid, self.calculatedColumns, self.activeAppliance)
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
const initApplianceFileName = 'rice_mill_usage_profile'
const activeApplianceFileInfo = _.find(applianceFiles, { fileName: initApplianceFileName })

// Model inputs must have a definition in the fieldDefinitions file
const initialModelInputsState = {
  kwFactorToKw: fieldDefinitions['kwFactorToKw'].defaultValue,
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
  enabledStates: disableAllAncillaryEquipment(ancillaryEquipment),
}

//Hook React Router up to Store
const routerModel = RouterModel.create()
//Hook up router model to browser history object
const history = syncHistoryWithStore(createBrowserHistory(), routerModel)

const initHomerFileName = '12-50 Oversize 20' // TODO: Check localforage
const activeGridInfo = _.find(sampleHomerFiles, { fileName: initHomerFileName })
const availableGrids = sampleHomerFiles // TODO: concat in files fromm localForage

let initialMainState = {
  activeGridInfo,
  activeGrid: GridStore.create({ ...initialGridState, ...{ gridName: 'activeGrid' } }),
  activeGridIsLoading: true,
  stagedGrid: null,
  // TOOD: load availableGrids from sample files and localForage
  // TODO: gridName should be gridStatus
  availableGrids: _.map(availableGrids, grid => {
    return GridStore.create({ ...initialGridState, ...grid, ...{ gridName: 'activeGrid' } })
  }),

  initApplianceFileName,
  applianceIsLoading: false,
  activeApplianceFileInfo,
  activeAppliance: [],

  excludedTableColumns: [],

  modelInputs: ModelInputsStore.create(initialModelInputsState),
  ancillaryEquipment: AncillaryEquipmentStore.create(initialAncillaryEquipmentState),
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
autorun(() => mainStore.fetchActiveGrid(mainStore.activeGridInfo))
autorun(() => mainStore.fetchAppliance(mainStore.activeApplianceFileInfo))

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
