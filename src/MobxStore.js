import _ from 'lodash'
import { configure, observable, decorate, action, runInAction, computed, autorun } from 'mobx'
import localStorage from 'mobx-localstorage'
import * as tf from '@tensorflow/tfjs'
import { fetchFile, combineTables } from 'utils/helpers'

import { getHomerStats, getSummaryStats } from 'utils/calculateStats'
import { calculateNewLoads } from 'utils/calculateNewColumns'
import { homerFiles, applianceFiles, ancillaryEquipment } from 'utils/fileInfo'
import { fieldDefinitions } from 'utils/fieldDefinitions'
import {
  computeBaselineLoss,
  convertTableToTrainingData,
  calculateTestSetLoss,
  calculateFinalLoss,
  arraysToTensors,
  calculatePlottablePredictedVsActualData,
  multiLayerPerceptronRegressionModel1Hidden,
} from 'utils/tensorflowHelpers'
import { getAncillaryEquipmentStatus } from 'utils/ancillaryEquipmentRules'
import { combinedColumnHeaderOrder } from 'utils/columnHeaders'
configure({ enforceActions: 'observed' })

class MobxStore {
  constructor() {
    autorun(() => this.fetchHomer(this.activeHomerFileInfo))
    autorun(() => this.fetchAppliance(this.activeApplianceFileInfo))
    autorun(() => this.trainBatteryModel(this.calculatedColumns))
    // Is not observed. We need to run the onChange handler
    // autorun(() => {
    //   this.windowPathName = window.location.pathname
    // })

    autorun(() =>
      this.battery1HiddenRegressor(
        this.batteryNumFeatures,
        this.batteryTensors,
        this.batteryLearningRate,
        this.batteryBatchSize,
        this.batteryEpochCount,
        this.batteryTrainingColumns
      )
    )

    // Set Ancillary Equipment enabled/disabled status based on if it is required:
    autorun(() => this.setAncillaryEquipmentEnabledFromStatus(this.ancillaryEquipmentStatus))

    // Saving and loading some items to localstorage
    // Round trips to JSON require special handling for ES6 Maps: https://stackoverflow.com/a/28918362
    autorun(() =>
      localStorage.setItem(
        'excludedTableColumns',
        JSON.stringify(Array.from(this.excludedTableColumns.entries()))
      )
    )
  }

  windowPathName = null
  initHomerFileName = '12-50 Oversize 20'
  initApplianceFileName = 'rice_mill_usage_profile'
  activeHomer = null
  activeAppliance = null
  activeHomerFileInfo = _.find(homerFiles, { fileName: this.initHomerFileName })
  activeApplianceFileInfo = _.find(applianceFiles, { fileName: this.initApplianceFileName })
  homerIsLoading = false
  applianceIsLoading = false
  appCalculating = false

  // Model inputs must have a definition in the fieldDefinitions file
  modelInputs = {
    kwFactorToKw: fieldDefinitions['kwFactorToKw'].defaultValue,
    dutyCycleDerateFactor: _.get(this.activeApplianceFileInfo, 'defaults.dutyCycleDerateFactor', 1),
    seasonalDerateFactor: null,
    wholesaleElectricityCost: 5,
    unmetLoadCostPerKwh: 6,
    retailElectricityPrice: 8,
    productionUnitsPerKwh: 5,
    revenuePerProductionUnits: 2,
    revenuePerProductionUnitsUnits: '$ / kg',
  }

  get calculatedColumns() {
    return calculateNewLoads({
      homer: this.activeHomer,
      appliance: this.activeAppliance,
      modelInputs: this.modelInputs,
      homerStats: this.homerStats,
      constants: {},
    })
  }

  get combinedTable() {
    return combineTables(this.activeHomer, this.calculatedColumns, this.activeAppliance)
  }

  get homerStats() {
    return _.isEmpty(this.activeHomer) ? null : getHomerStats(this.activeHomer)
  }

  get summaryStats() {
    return _.isEmpty(this.calculatedColumns)
      ? null
      : getSummaryStats(this.calculatedColumns, this.modelInputs)
  }

  async fetchHomer(activeHomerFileInfo) {
    this.homerIsLoading = true
    const homer = await fetchFile(activeHomerFileInfo, window.location)
    runInAction(() => {
      this.activeHomer = homer
      this.homerIsLoading = false
    })
  }

  async fetchAppliance(fileInfo) {
    this.applianceIsLoading = true
    const appliance = await fetchFile(fileInfo, window.location)
    runInAction(() => {
      this.activeAppliance = appliance
      this.applianceIsLoading = false
    })
  }

  // Choose HOMER or Appliance File Form changes
  setActiveHomerFile(event, data) {
    this.activeHomerFileInfo = _.find(homerFiles, {
      fileName: data.value,
    })
  }

  setActiveApplianceFile(event, data) {
    this.activeApplianceFileInfo = _.find(applianceFiles, {
      fileName: data.value,
    })
  }

  // Model Input form change handlers
  onModelInputChange(fieldKey, value) {
    this.modelInputs[fieldKey] = value
  }

  /**
   * Table Column Visibility (checkboxes to turn columnns on or off)
   * Also includes state for search filtering the list
   */
  excludedTableColumns = new Map(JSON.parse(localStorage.getItem('excludedTableColumns')))

  setExcludedTableColumns(columnName) {
    if (this.excludedTableColumns.has(columnName)) {
      this.excludedTableColumns.delete(columnName)
    } else {
      this.excludedTableColumns.set(columnName, true)
    }
  }

  get filteredCombinedTableHeaders() {
    return _.filter(combinedColumnHeaderOrder, header => {
      return !this.excludedTableColumns.has(header)
    })
  }

  get percentTableColumnsShowing() {
    return _.round(
      (_.size(this.filteredCombinedTableHeaders) / _.size(combinedColumnHeaderOrder)) * 100
    )
  }

  /**
   * Battery Characterization Model
   * Trained on HOMER file's battery State of Charge
   * I will likely want to async'ly do this for eveyr loaded HOMER file, so the
   * user can switch back and forth a between HOMER files and not have to retrain each time
   */
  batteryEpochCount = 10
  batteryCurrentEpoch = 0
  batteryModelStopLoss = 0.1
  batteryBatchSize = 40
  batteryLearningRate = 0.01
  batteryTargetColumn = 'Battery State of Charge'
  batteryTrainingColumns = ['electricalProductionLoadDiff', 'prevBatterySOC']
  batteryTrainingData = {}
  batteryTrainingTime = null
  batteryModel = null
  batteryModelName = ''
  batteryTrainingState = 'None'
  batteryTrainLogs = []
  batteryWeightsList = []
  batteryFinalTrainSetLoss = null
  batteryValidationSetLoss = null
  batteryTestSetLoss = null

  async trainBatteryModel(calculatedColumns) {
    if (_.isEmpty(this.combinedTable)) {
      return null
    }
    runInAction(() => {
      this.batteryTrainingData = convertTableToTrainingData(
        this.combinedTable,
        this.batteryTargetColumn,
        this.batteryTrainingColumns
      )
    })
  }

  get batteryTensors() {
    if (_.isEmpty(this.batteryTrainingData)) {
      return null
    }
    const { trainFeatures, trainTarget, testFeatures, testTarget } = this.batteryTrainingData
    return arraysToTensors(trainFeatures, trainTarget, testFeatures, testTarget)
  }

  get batteryNumFeatures() {
    return _.size(this.batteryTrainingColumns)
  }

  get batteryInputTensorShape() {
    return [1, _.size(this.batteryTrainingColumns)]
  }

  get batteryWeightsListSorted() {
    return this.weightsList.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  }

  get batteryBaselineLoss() {
    return this.bostonDataIsLoading ? null : computeBaselineLoss(this.tensors)
  }

  get batteryPlottablePredictionVsActualData() {
    if (_.isEmpty(this.batteryModel)) {
      return []
    }
    return calculatePlottablePredictedVsActualData(
      this.batteryTrainingData,
      this.batteryModel,
      this.batteryInputTensorShape
    )
  }

  get batteryPlottableReferenceLine() {
    if (_.isEmpty(this.batteryTrainingData)) {
      return []
    }
    const { trainTarget, testTarget } = this.batteryTrainingData
    const allTargets = _.map(trainTarget.concat(testTarget), target => target[0])
    const range = _.range(_.round(_.min(allTargets)), _.round(_.max(allTargets)))
    return _.map(range, val => {
      return { actual: val, predicted: val }
    })
  }

  get batteryTrainingTimeDisplay() {
    return `${_.round(this.batteryTrainingTime / 1000)} sec (~${_.round(
      this.batteryTrainingTime / 1000 / this.batteryEpochCount
    )} sec/epoch)`
  }

  async battery1HiddenRegressor(
    numFeatures,
    tensors,
    learningRate,
    batchSize,
    epochCount,
    trainingColumns
  ) {
    runInAction(() => {
      this.batteryModelName = 'Neural Network Regression with 1 Hidden Layer'
    })
    await this.batteryModelRun({
      model: multiLayerPerceptronRegressionModel1Hidden(numFeatures),
      tensors: tensors,
      learningRate,
      batchSize,
      epochCount,
      trainingColumns,
    })
  }

  // The reason this complicated function is in the store is because it wiil
  // update the UI by saving out an obervable as it trains. Since it's in the
  // store I could just reference all of the store values like batchSize intead
  // of passing them in. I prefer to explicitly pass them in though since it
  // makes a clearer and more testable function. But this function has side effects
  // I could put this in utils and then just pass in this.currentEpoch and trainLogs
  async batteryModelRun({ model, tensors, learningRate, batchSize, epochCount, trainingColumns }) {
    if (_.isEmpty(tensors)) {
      return null
    }
    model.compile({
      optimizer: tf.train.sgd(learningRate),
      loss: 'meanSquaredError',
    })
    this.batteryTrainingState = 'Training'
    const t0 = performance.now()
    await model.fit(tensors.trainFeatures, tensors.trainTarget, {
      batchSize: batchSize,
      epochs: epochCount,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          const t1 = performance.now()
          runInAction(() => {
            this.batteryCurrentEpoch = epoch
            this.batteryTrainLogs.push({ epoch, ...logs })
            this.batteryTrainingTime = t1 - t0
          })
        },
        onTrainEnd: () => {
          const testSetLoss = calculateTestSetLoss(model, tensors, batchSize)
          const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
            this.batteryTrainLogs
          )
          const t1 = performance.now()
          runInAction(() => {
            this.batteryModel = model
            this.batteryTestSetLoss = testSetLoss
            this.batteryFinalTrainSetLoss = finalTrainSetLoss
            this.batteryValidationSetLoss = finalValidationSetLoss
            this.batteryTrainingTime = t1 - t0
            this.batteryTrainingState = 'Trained'
          })
        },
      },
    })
  }

  /*
   * Ancillary Equipment Options
   */
  // Initially set all ancillary equipment to disabled (false)
  ancillaryEquipmentEnabledStates = _.reduce(
    ancillaryEquipment,
    (result, item) => {
      result[item['equipmentType']] = false
      return result
    },
    {}
  )

  // Status is whether the equipment is required, usefor or not useful based on rules
  get ancillaryEquipmentStatus() {
    return getAncillaryEquipmentStatus(
      this.activeHomerFileInfo,
      this.activeApplianceFileInfo,
      ancillaryEquipment
    )
  }

  // Set from checkboxes in UI
  setAncillaryEquipmentEnabledFromCheckbox(equipmentType, enabled) {
    this.ancillaryEquipmentEnabledStates[equipmentType] = enabled
  }

  // Required equipment will be auto-enabled
  // Call from autorun in constructor when ancillaryEquipmentStatus changes
  setAncillaryEquipmentEnabledFromStatus(ancillaryEquipmentStatus) {
    const required = ancillaryEquipmentStatus['required']
    if (!_.isEmpty(required)) {
      runInAction(() => {
        _.forEach(required, equipment => {
          this.ancillaryEquipmentEnabledStates[equipment['equipmentType']] = true
        })
      })
    }
  }

  // List of selected ancillary equipment by label
  get enabledAncillaryEquipmentList() {
    return _(this.ancillaryEquipmentEnabledStates)
      .pickBy(val => val === true)
      .keys()
      .map(equipmentType => _.find(ancillaryEquipment, { equipmentType }).label)
      .value()
  }
}

decorate(MobxStore, {
  // windowPathName: observable,
  activeHomer: observable,
  activeHomerFileInfo: observable,
  activeAppliance: observable,
  activeApplianceFileInfo: observable,
  homerIsLoading: observable,
  applianceIsLoading: observable,
  modelInputs: observable,
  fetchHomer: action,
  fetchAppliance: action,
  calculatedColumns: computed,
  combinedTable: computed,
  filteredCombinedTableHeaders: computed,
  homerStats: computed,
  summaryStats: computed,
  setActiveHomerFile: action.bound,
  setActiveApplianceFile: action.bound,
  onModelInputChange: action.bound,

  // Table column checkboxes
  excludedTableColumns: observable,
  setExcludedTableColumns: action.bound,

  // Tensorflow model data:
  batteryEpochCount: observable,
  batteryCurrentEpoch: observable,
  batteryModelStopLoss: observable,
  batteryBatchSize: observable,
  batteryLearningRate: observable,
  batteryTargetColumn: observable,
  batteryTrainingColumns: observable,
  batteryTrainingData: observable,
  batteryTrainingTime: observable,
  batteryTrainingTimeDisplay: computed,
  batteryTensors: computed,
  batteryModel: observable,
  batteryNumFeatures: computed,
  batteryInputTensorShape: computed,
  batteryTrainingState: observable,
  batteryTrainLogs: observable,
  batteryWeightsList: observable,
  batteryFinalTrainSetLoss: observable,
  batteryValidationSetLoss: observable,
  batteryTestSetLoss: observable,
  batteryModelRun: action.bound,
  batteryLinearRegressor: action.bound,
  batteryWeightsListSorted: computed,
  batteryBaselineLoss: computed,
  batteryPlottablePredictionVsActualData: computed,
  batteryPlottableReferenceLine: computed,

  // Ancillery Equipment
  ancillaryEquipmentEnabledStates: observable,
  ancillaryEquipmentStatus: computed,
  setAncillaryEquipmentEnabledFromCheckbox: action.bound,
  setAncillaryEquipmentEnabledFromStatus: action.bound,
  enabledAncillaryEquipmentList: computed,
})

export default MobxStore
