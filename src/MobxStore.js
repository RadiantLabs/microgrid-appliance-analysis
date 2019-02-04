import _ from 'lodash'
import { autorun } from 'mobx'
import { types, flow, applySnapshot, onSnapshot } from 'mobx-state-tree'
// import * as tf from '@tensorflow/tfjs'
import { fetchFile, combineTables } from 'utils/helpers'
import { getHomerStats, getSummaryStats } from 'utils/calculateStats'
import { calculateNewLoads } from 'utils/calculateNewColumns'
import { homerFiles, applianceFiles, ancillaryEquipment } from 'utils/fileInfo'
import { fieldDefinitions } from 'utils/fieldDefinitions'
// import {
//   computeBaselineLoss,
//   convertTableToTrainingData,
//   calculateTestSetLoss,
//   calculateFinalLoss,
//   arraysToTensors,
//   calculatePlottablePredictedVsActualData,
//   multiLayerPerceptronRegressionModel1Hidden,
// } from 'utils/tensorflowHelpers'
// import { getAncillaryEquipmentStatus } from 'utils/ancillaryEquipmentRules'
import { combinedColumnHeaderOrder } from 'utils/columnHeaders'

/**
 * Editable Field Store
 */
export const ModelInputs = types
  .model({
    // TODO: rename kwFactorToKw
    kwFactorToKw: types.maybeNull(types.number),
    dutyCycleDerateFactor: types.maybeNull(types.number),
    seasonalDerateFactor: types.maybeNull(types.number),
    wholesaleElectricityCost: types.maybeNull(types.number),
    unmetLoadCostPerKwh: types.maybeNull(types.number),
    retailElectricityPrice: types.maybeNull(types.number),
    productionUnitsPerKwh: types.maybeNull(types.number),
    revenuePerProductionUnits: types.maybeNull(types.number),
    revenuePerProductionUnitsUnits: types.maybeNull(types.string),
  })
  .actions(self => ({
    onModelInputChange(fieldKey, value) {
      self[fieldKey] = value
    },
  }))

/**
 * Primary Store
 */
export const MobxStore = types
  .model({
    // Homer Data
    initHomerFileName: types.string,
    homerIsLoading: types.boolean,
    activeHomerFileInfo: types.frozen(),
    activeHomer: types.frozen(),

    // Appliance Info
    initApplianceFileName: types.string,
    applianceIsLoading: types.boolean,
    activeApplianceFileInfo: types.frozen(),
    activeAppliance: types.frozen(),

    // editable fields - may make this an array of ModelInputs eventually
    modelInputs: ModelInputs,

    excludedTableColumns: types.optional(types.array(types.string), []),
  })
  .actions(self => ({
    afterCreate() {
      self.fetchHomer(self.activeHomerFileInfo)
      self.fetchAppliance(self.activeApplianceFileInfo)
    },
    fetchHomer: flow(function* load(activeHomerFileInfo) {
      self.homerIsLoading = true
      const homer = yield fetchFile(activeHomerFileInfo, window.location)
      self.activeHomer = homer
      self.homerIsLoading = false
    }),
    fetchAppliance: flow(function* load(activeApplianceFileInfo) {
      self.applianceIsLoading = true
      const appliance = yield fetchFile(activeApplianceFileInfo, window.location)
      self.activeAppliance = appliance
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
const initHomerFileName = '12-50 Oversize 20'
const initApplianceFileName = 'rice_mill_usage_profile'
const activeHomerFileInfo = _.find(homerFiles, { fileName: initHomerFileName })
const activeApplianceFileInfo = _.find(applianceFiles, { fileName: initApplianceFileName })

// Model inputs must have a definition in the fieldDefinitions file
const initialModelInputs = {
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

let initialState = {
  initHomerFileName,
  homerIsLoading: true,
  activeHomerFileInfo,
  activeHomer: [],

  initApplianceFileName,
  applianceIsLoading: false,
  activeApplianceFileInfo,
  activeAppliance: [],

  modelInputs: ModelInputs.create(initialModelInputs),
  excludedTableColumns: [],
}

// Load entire state fromm local storage as long as the model shape are this same
// This allows the developer to modify the model and get a fresh state
// if (localStorage.getItem('microgridAppliances')) {
//   const json = JSON.parse(localStorage.getItem('microgridAppliances'))
//   if (MobxStore.is(json)) {
//     initialState = json
//   }
// }

// Only load selective pieces of the state for now
if (localStorage.getItem('microgridAppliances_excludedTableColumns')) {
  const excludedTableColumns = JSON.parse(
    localStorage.getItem('microgridAppliances_excludedTableColumns')
  )
  initialState = { ...initialState, ...{ excludedTableColumns } }
}

/**
 * Instantiate Primary Store
 */
let mobxStore = MobxStore.create(initialState)
window.mobxStore = mobxStore // inspect the store at any time.

/**
 * Watch for snapshot changes
 */
onSnapshot(mobxStore, snapshot => {
  // localStorage.setItem('microgridAppliances', JSON.stringify(snapshot))
  localStorage.setItem(
    'microgridAppliances_excludedTableColumns',
    JSON.stringify(snapshot.excludedTableColumns)
  )
})

/**
 * Run functions whenever arguments change
 */
autorun(() => mobxStore.fetchHomer(mobxStore.activeHomerFileInfo))
autorun(() => mobxStore.fetchAppliance(mobxStore.activeApplianceFileInfo))

export { mobxStore }
