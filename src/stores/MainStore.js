import _ from 'lodash'
import { autorun, runInAction } from 'mobx'
import { types, flow, onSnapshot, getSnapshot } from 'mobx-state-tree'
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
import { sampleGridFileInfos, sampleApplianceFiles, ancillaryEquipment } from 'utils/fileInfo'
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
    activeGridFileInfo: types.frozen(),
    activeGrid: types.maybeNull(GridStore),
    activeGridIsLoading: types.boolean,
    stagedGrid: types.maybeNull(GridStore),
    availableGrids: types.optional(types.array(GridStore), []), // Option 1

    // Appliance Info
    activeApplianceInfo: types.frozen(),
    activeAppliance: types.maybeNull(ApplianceStore),
    activeApplianceIsLoading: types.boolean,
    availableAppliances: types.optional(types.array(ApplianceStore), []),

    excludedTableColumns: types.optional(types.array(types.string), []),
    modelInputs: ModelInputsStore,
    ancillaryEquipment: AncillaryEquipmentStore,
    router: RouterModel,
  })
  .actions(self => ({
    fetchActiveGrid: flow(function* fetchActiveGrid(fileInfo) {
      self.activeGridIsLoading = true
      yield self.activeGrid.loadFile(fileInfo)
      self.activeGridIsLoading = false
    }),
    fetchActiveAppliance: flow(function* fetchActiveAppliance(activeApplianceInfo) {
      self.activeApplianceIsLoading = true
      yield self.activeAppliance.loadApplianceFile(activeApplianceInfo)
      self.activeApplianceIsLoading = false
    }),
    // loadAvailableGrids: flow(function* loadAvailableGrids() {
    // // All of these availableGrids will be instantiated GridStores with barely any data
    // for (let grid of self.availableGrids) {
    //  await grid.loadGridFile();
    // }
    // }),
    setActiveGridFile(event, data) {
      const selectedGrid = _.find(self.availableGrids, grid => {
        return grid.fileInfo.id === data.value
      })
      runInAction(() => {
        // Cannot have the same instance of a grid assigned to two places at cone
        // temporarily store activeGrid
        const tempActiveGrid = self.activeGrid
        // Removed selected grid from availableGrids
        _.remove(self.availableGrids, grid => grid.fileInfo.id === data.value)
        // Assign selected grid to active grid
        self.activeGrid = GridStore.create(selectedGrid)
        // Push old active grid to available grids
        self.availableGrids.push(GridStore.create(tempActiveGrid))
      })
    },
    setActiveApplianceFile(event, data) {
      self.activeApplianceInfo = _.find(sampleApplianceFiles, {
        fileLabel: data.value,
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
      return combineTables(self.activeGrid.fileData, self.calculatedColumns, self.activeAppliance)
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

const initApplianceFileId = 'rice_mill_usage_profile' // TODO: Check localforage
const activeApplianceInfo = _.find(sampleApplianceFiles, { fileName: initApplianceFileId })
const availableAppliances = sampleApplianceFiles // TODO: concat in files fromm localForage

// Model inputs must have a definition in the fieldDefinitions file
const initialModelInputsState = {
  kwFactorToKw: fieldDefinitions['kwFactorToKw'].defaultValue,
  dutyCycleDerateFactor: _.get(activeApplianceInfo, 'defaults.dutyCycleDerateFactor', 1),
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

let initialMainState = {
  activeGridFileInfo, // Do I keep fileInfo in both the mainStore and the gridStore? For now, yes
  activeGrid: GridStore.create({
    ...initialGridState,
    ...{ fileInfo: activeGridFileInfo },
    ...{ fileLabel: activeGridFileInfo.label, fileDescription: activeGridFileInfo.description },
    ...{ gridStoreName: 'activeGrid' },
  }),
  activeGridIsLoading: true,
  stagedGrid: null,
  availableGrids: _.map(availableGridFileInfos, gridInfo => {
    return GridStore.create({
      ...initialGridState,
      ...{ fileInfo: gridInfo },
      ...{ fileLabel: gridInfo.label, fileDescription: gridInfo.description },
      ...{ gridStoreName: 'availableGrid' },
    })
  }),

  activeApplianceInfo,
  activeAppliance: ApplianceStore.create({
    ...initialApplianceState,
    ...{ applianceStoreName: 'activeAppliance' },
  }),
  activeApplianceIsLoading: true,
  availableAppliances: _.map(availableAppliances, appliance => {
    return ApplianceStore.create({
      ...initialApplianceState,
      ...appliance,
      ...{ applianceStoreName: 'availableAppliance' },
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
autorun(() => mainStore.fetchActiveGrid(mainStore.activeGridFileInfo))
autorun(() => mainStore.fetchActiveAppliance(mainStore.activeApplianceInfo))

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
