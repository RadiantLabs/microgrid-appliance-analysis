import _ from 'lodash'
import { configure, observable, decorate, action, runInAction, computed, autorun } from 'mobx'
import localStorage from 'mobx-localstorage'
import * as tf from '@tensorflow/tfjs'
import { fetchFile, combineTables } from './utils/helpers'

import { getHomerStats, getSummaryStats } from './utils/calculateStats'
import { calculateNewLoads } from './utils/calculateNewColumns'
import { homerFiles, applianceFiles } from './utils/fileInfo'
import { fieldDefinitions } from './utils/fieldDefinitions'
import {
  computeBaselineLoss,
  convertTableToTensors,
  linearRegressionModel,
  describeKernelElements,
  calculateTestSetLoss,
  calculateFinalLoss,
} from './utils/tensorflowHelpers'
import { combinedColumnHeaderOrder } from './utils/columnHeaders'
configure({ enforceActions: 'observed' })

// const initHomerPath = './data/homer/12-50 Baseline.csv'
const initHomerPath = './data/homer/12-50 Oversize 20.csv'
// const initHomerPath = './data/homer/homer_12_50_oversize_20_AS.csv'  // debugging
const initAppliancePath = './data/appliances/rice_mill_usage_profile.csv'

class MobxStore {
  constructor() {
    autorun(() => this.fetchHomer(this.activeHomerFileInfo))
    autorun(() => this.fetchAppliance(this.activeApplianceFileInfo))
    autorun(() => this.trainBatteryModel(this.calculatedColumns))
    autorun(() =>
      this.batteryLinearRegressor(
        this.batteryNumFeatures,
        this.batteryTensors,
        this.batteryLearningRate,
        this.batteryBatchSize,
        this.batteryEpochCount,
        this.batteryTrainingColumns
      )
    )

    // Saving and loading some items to localstorage
    // Round trips to JSON require special handling for ES6 Maps: https://stackoverflow.com/a/28918362
    autorun(() =>
      localStorage.setItem(
        'excludedTableColumns',
        JSON.stringify(Array.from(this.excludedTableColumns.entries()))
      )
    )
  }

  activeHomer = null
  activeAppliance = null
  activeHomerFileInfo = _.find(homerFiles, { path: initHomerPath })
  activeApplianceFileInfo = _.find(applianceFiles, { path: initAppliancePath })
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
    const homer = await fetchFile(activeHomerFileInfo)
    runInAction(() => {
      this.activeHomer = homer
      this.homerIsLoading = false
    })
  }

  async fetchAppliance(fileInfo) {
    this.applianceIsLoading = true
    const appliance = await fetchFile(fileInfo)
    runInAction(() => {
      this.activeAppliance = appliance
      this.applianceIsLoading = false
    })
  }

  // Choose HOMER or Appliance File Form changes
  setActiveHomerFile(event, data) {
    this.activeHomerFileInfo = _.find(homerFiles, {
      path: data.value,
    })
  }

  setActiveApplianceFile(event, data) {
    this.activeApplianceFileInfo = _.find(applianceFiles, {
      path: data.value,
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

  // setMultipleExcludedTableColumns(columnNames) {
  //   _.forEach(columnNames, columnName => this.setExcludedTableColumns(columnName))
  // }

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
  batteryEpochCount = 4
  batteryCurrentEpoch = 0
  batteryBatchSize = 40
  batteryLearningRate = 0.01
  batteryTargetColumn = 'Battery State of Charge'
  batteryTrainingColumns = ['electricalProductionLoadDiff', 'prevBatterySOC']
  batteryTensors = {}
  batteryModel = null
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
      this.batteryTensors = convertTableToTensors(
        this.combinedTable,
        this.batteryTargetColumn,
        this.batteryTrainingColumns
      )
    })
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

  // Modify this to work on different datasets instead of regression models
  async batteryLinearRegressor(
    numFeatures,
    tensors,
    learningRate,
    batchSize,
    epochCount,
    trainingColumns
  ) {
    console.log('running: batteryLinearRegressor')
    await this.batteryModelRun({
      model: linearRegressionModel(numFeatures),
      tensors: tensors,
      weightsIllustration: true,
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
  async batteryModelRun({
    model,
    tensors,
    weightsIllustration,
    learningRate,
    batchSize,
    epochCount,
    trainingColumns,
  }) {
    if (_.isEmpty(tensors)) {
      return null
    }
    model.compile({
      optimizer: tf.train.sgd(learningRate),
      loss: 'meanSquaredError',
    })
    this.batteryTrainingState = 'Training'
    console.log('running: batteryModelRun after check')
    await model.fit(tensors.trainFeatures, tensors.trainTarget, {
      batchSize: batchSize,
      epochs: epochCount,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          runInAction(() => {
            this.batteryCurrentEpoch = epoch
            this.batteryTrainLogs.push({ epoch, ...logs })
          })
          if (weightsIllustration) {
            model.layers[0]
              .getWeights()[0]
              .data()
              .then(kernelAsArr => {
                runInAction(() => {
                  this.batteryWeightsList = describeKernelElements(kernelAsArr, trainingColumns)
                })
              })
          }
        },
        onTrainEnd: () => {
          const testSetLoss = calculateTestSetLoss(model, tensors, batchSize)
          const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
            this.batteryTrainLogs
          )
          runInAction(() => {
            this.batteryModel = model
            this.batteryTestSetLoss = testSetLoss
            this.batteryFinalTrainSetLoss = finalTrainSetLoss
            this.batteryValidationSetLoss = finalValidationSetLoss
            this.batteryTrainingState = 'Trained'
          })
        },
      },
    })
  }
}

decorate(MobxStore, {
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
  batteryBatchSize: observable,
  batteryLearningRate: observable,
  batteryTargetColumn: observable,
  batteryTrainingColumns: observable,
  batteryTensors: observable,
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
})

export default MobxStore
// export let mobxStore = new MobxStore()
