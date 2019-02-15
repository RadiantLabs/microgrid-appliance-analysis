import _ from 'lodash'
import { autorun } from 'mobx'
import { types, flow, onSnapshot, getSnapshot } from 'mobx-state-tree'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import localforage from 'localforage'

// Import Other Stores:
import { ModelInputsStore } from './ModelInputsStore'
import { AncillaryEquipmentStore } from './AncillaryEquipmentStore'
import { Grid1Store, initialHomerState } from './Grid1Store'
import { GridStore, initialGridState } from './GridStore'

// Import Helpers and domain data
import { combineTables } from 'utils/helpers'
import { fetchFile } from 'utils/importFileHelpers'
import { getHomerStats, getSummaryStats } from 'utils/calculateStats'
import { calculateNewLoads } from 'utils/calculateNewColumns'
import { homerFiles, sampleHomerFiles, applianceFiles, ancillaryEquipment } from 'utils/fileInfo'
import { fieldDefinitions } from 'utils/fieldDefinitions'
import { combinedColumnHeaderOrder } from 'utils/columnHeaders'
import { disableAllAncillaryEquipment } from 'utils/ancillaryEquipmentRules'

/**
 * Primary Store
 */
export const MainStore = types
  .model({
    // Homer Data
    initHomerFileName: types.string,
    homerIsLoading: types.boolean,
    activeHomerFileInfo: types.frozen(),
    activeHomer: types.frozen(),
    grid: Grid1Store,

    // Temporary names until I get Homer uploads working and switching
    activeGrid: types.maybeNull(GridStore),
    activeGridId: types.optional(types.number, 0),
    stagedGrid: types.maybeNull(GridStore),
    storedGrids: types.optional(types.array(GridStore), []),

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
    afterCreate() {
      self.fetchHomer(self.activeHomerFileInfo)
      self.fetchAppliance(self.activeApplianceFileInfo)
    },
    fetchHomer: flow(function* fetchHomer(activeHomerFileInfo) {
      self.homerIsLoading = true
      self.activeHomer = yield fetchFile(activeHomerFileInfo, window.location)
      self.homerIsLoading = false
    }),
    fetchAppliance: flow(function* fetchAppliance(activeApplianceFileInfo) {
      self.applianceIsLoading = true
      self.activeAppliance = yield fetchFile(activeApplianceFileInfo, window.location)
      self.applianceIsLoading = false
    }),
    // Choose active HOMER or Appliance file
    setActiveHomerFile(event, data) {
      self.activeHomerFileInfo = _.find(homerFiles, {
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
        homer: self.activeHomer,
        appliance: self.activeAppliance,
        modelInputs: self.modelInputs,
        homerStats: self.homerStats,
        constants: {},
      })
    },
    get combinedTable() {
      return combineTables(self.activeHomer, self.calculatedColumns, self.activeAppliance)
    },
    get homerStats() {
      return _.isEmpty(self.activeHomer) ? null : getHomerStats(self.activeHomer)
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

/**
 * Initialize Mobx State Tree Store
 */
// TODO: initHomerFileName needs to be pulled from localforage or
// default to soemthing
const initHomerFileName = '12-50 Oversize 20'
const initApplianceFileName = 'rice_mill_usage_profile'
const activeHomerFileInfo = _.find(sampleHomerFiles, { fileName: initHomerFileName })
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

const initialAncillaryEquipmentState = {
  // Initially set all ancillary equipment to disabled (false)
  enabledStates: disableAllAncillaryEquipment(ancillaryEquipment),
}

/**
 * Hook React Router up to Store
 * Hook up router model to browser history object
 */
const routerModel = RouterModel.create()
const history = syncHistoryWithStore(createBrowserHistory(), routerModel)

let initialMainState = {
  initHomerFileName,
  homerIsLoading: true,
  activeHomerFileInfo,
  activeHomer: [],
  initApplianceFileName,
  applianceIsLoading: false,
  activeApplianceFileInfo,
  activeAppliance: [],
  excludedTableColumns: [],

  grid: Grid1Store.create(initialHomerState),

  // Temporary store names until I get this straighted out
  activeGrid: GridStore.create({ ...initialGridState, ...{ gridName: 'activeGrid' } }),
  activeGridId: 0,
  stagedGrid: GridStore.create({ ...initialGridState, ...{ gridName: 'stagedGrid' } }),
  storedGrids: [],

  router: routerModel,
  modelInputs: ModelInputsStore.create(initialModelInputsState),
  ancillaryEquipment: AncillaryEquipmentStore.create(initialAncillaryEquipmentState),
}

/**
 * State in localStorage
 */
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

// onSnapshot(mainStore, snapshot => {
//   console.log('snap: ', snapshot)
// })

/**
 * autorun: Run functions whenever arguments change
 */
autorun(() => mainStore.fetchHomer(mainStore.activeHomerFileInfo))
autorun(() => mainStore.fetchAppliance(mainStore.activeApplianceFileInfo))

// Set Ancillary Equipment enabled/disabled status based on if it is required:
autorun(() =>
  mainStore.ancillaryEquipment.setEquipmentEnabledFromStatus(
    mainStore.ancillaryEquipment.equipmentStatus
  )
)

// Run the battery regression model
autorun(() => {
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
