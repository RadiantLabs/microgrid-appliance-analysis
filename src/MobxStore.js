import _ from 'lodash'
import { configure, observable, decorate, action, runInAction, computed, autorun } from 'mobx'
// import * as tf from '@tensorflow/tfjs'
import {
  fetchFile,
  getHomerStats,
  getSummaryStats,
  calculateNewLoads,
  mergeArraysOfObjects,
} from './utils/helpers'
import { homerFiles, applianceFiles } from './utils/fileInfo'
import { fieldDefinitions } from './utils/fieldDefinitions'
import {
  // arraysToTensors,
  // shuffle,
  // linearRegressionModel,
  // describeKernelElements,
  computeBaselineLoss,
  convertTableToTensors,
  // computeAveragePrice,
  // multiLayerPerceptronRegressionModel1Hidden,
  // multiLayerPerceptronRegressionModel2Hidden,
  // calculateFinalLoss,
  // calculateTestSetLoss,
} from './utils/tensorflowHelpers'
configure({ enforceActions: 'observed' })

// const initHomerPath = './data/homer/12-50 Baseline.csv'
const initHomerPath = './data/homer/12-50 Oversize 20.csv'
const initAppliancePath = './data/appliances/rice_mill_usage_profile.csv'

class MobxStore {
  constructor() {
    autorun(() => this.fetchHomer(this.activeHomerFileInfo))
    autorun(() => this.fetchAppliance(this.activeApplianceFileInfo))
    // autorun(() => this.trainBatteryModel(this.calculatedColumns))
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
    if (_.isEmpty(this.activeHomer) || _.isEmpty(this.activeAppliance)) {
      return null
    }
    const t0 = performance.now()
    const calculatedNewLoads = calculateNewLoads({
      homer: this.activeHomer,
      appliance: this.activeAppliance,
      modelInputs: this.modelInputs,
      homerStats: this.homerStats,
      constants: {},
    })
    const t1 = performance.now()
    console.log('calculateNewLoads took ' + _.round(t1 - t0) + ' milliseconds.')
    return calculatedNewLoads
  }

  get combinedTable() {
    if (
      _.isEmpty(this.activeHomer) ||
      _.isEmpty(this.calculatedColumns) ||
      _.isEmpty(this.activeAppliance)
    ) {
      return []
    }
    const t0 = performance.now()
    const combinedTable = this.calculatedColumns
      ? mergeArraysOfObjects(
          'hour',
          _.drop(this.activeHomer, 2),
          _.drop(this.calculatedColumns, 2),
          _.drop(this.activeAppliance, 2)
        )
      : []
    const t1 = performance.now()
    console.log('combinedTable took ' + _.round(t1 - t0) + ' milliseconds.')
    return combinedTable
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
  excludedTableColumns = new Map()

  setExcludedTableColumns(data) {
    const columnName = data.label.props.children
    if (this.excludedTableColumns.has(columnName)) {
      this.excludedTableColumns.delete(columnName)
    } else {
      this.excludedTableColumns.set(columnName, true)
    }
  }

  /**
   * Battery Characterization Model
   * Trained on HOMER file's battery State of Charge
   * I will likely want to async'ly do this for eveyr loaded HOMER file, so the
   * user can switch back and forth a between HOMER files and not have to retrain each time
   */
  batteryEpochCount = 50
  batteryCurrentEpoch = 0
  batteryBatchSize = 40
  batteryLearningRate = 0.01
  batteryTargetColumn = 'Battery State of Charge'
  batteryTrainingColumns = ['hour', 'electricalProductionLoadDiff', 'prevBatterySOC']
  batteryTensors = {}
  batteryNumFeatures = null
  batteryTrainingState = 'None'
  batteryTrainLogs = []
  batteryWeightsList = []
  batteryFinalTrainSetLoss = null
  batteryValidationSetLoss = null
  batteryTestSetLoss = null

  async trainBatteryModel(calculatedColumns) {
    if (!_.isEmpty(this.combinedTable)) {
      const temp = convertTableToTensors(
        this.combinedTable,
        this.batteryTargetColumn,
        this.batteryTrainingColumns
      )
      console.log('temp: ', temp)
      return temp
    }
  }

  get batteryWeightsListSorted() {
    return this.weightsList.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  }

  get batteryBaselineLoss() {
    return this.bostonDataIsLoading ? null : computeBaselineLoss(this.tensors)
  }

  // Modify this to work on different datasets instead of regression models
  // async batteryTrainLinearRegressor() {
  //   const model = linearRegressionModel(this.numFeatures)
  //   await this.run({
  //     model,
  //     tensors: this.tensors,
  //     modelName: 'linear',
  //     weightsIllustration: true,
  //     LEARNING_RATE: this.LEARNING_RATE,
  //     BATCH_SIZE: this.BATCH_SIZE,
  //     NUM_EPOCHS: this.NUM_EPOCHS,
  //   })
  // }

  // The reason this complicated function is in the store is because it wiil
  // update the UI by saving out an obervable as it trains. Since it's in the
  // store I could just reference all of the store values like BATCH_SIZE intead
  // of passing them in. I prefer to explicitly pass them in though since it
  // makes a clearer and more testable function. But this function has side effects
  // I could put this in utils and then just pass in this.currentEpoch and trainLogs
  // async batteryRun({
  //   model,
  //   tensors,
  //   modelName,
  //   weightsIllustration,
  //   LEARNING_RATE,
  //   BATCH_SIZE,
  //   NUM_EPOCHS,
  // }) {
  //   model.compile({
  //     optimizer: tf.train.sgd(LEARNING_RATE),
  //     loss: 'meanSquaredError',
  //   })
  //   this.trainingState[modelName] = 'Training'
  //   await model.fit(tensors.trainFeatures, tensors.trainTarget, {
  //     batchSize: BATCH_SIZE,
  //     epochs: NUM_EPOCHS,
  //     validationSplit: 0.2,
  //     callbacks: {
  //       onEpochEnd: async (epoch, logs) => {
  //         runInAction(() => {
  //           this.currentEpoch[modelName] = epoch
  //           this.trainLogs[modelName].push({ epoch, ...logs })
  //         })
  //         if (weightsIllustration) {
  //           model.layers[0]
  //             .getWeights()[0]
  //             .data()
  //             .then(kernelAsArr => {
  //               runInAction(() => {
  //                 this.weightsList[modelName] = describeKernelElements(
  //                   kernelAsArr,
  //                   featureDescriptions
  //                 )
  //               })
  //             })
  //         }
  //       },
  //       onTrainEnd: () => {
  //         const testSetLoss = calculateTestSetLoss(model, tensors, this.BATCH_SIZE)
  //         const { finalTrainSetLoss, finalValidationSetLoss } = calculateFinalLoss(
  //           this.trainLogs[modelName]
  //         )
  //         runInAction(() => {
  //           this.testSetLoss[modelName] = testSetLoss
  //           this.finalTrainSetLoss[modelName] = finalTrainSetLoss
  //           this.finalValidationSetLoss[modelName] = finalValidationSetLoss
  //           this.trainingState[modelName] = 'Trained'
  //         })
  //       },
  //     },
  //   })
  // }
}

decorate(MobxStore, {
  activeHomer: observable,
  activeHomerFileInfo: observable,
  activeAppliance: observable,
  activeApplianceFileInfo: observable,
  homerIsLoading: observable,
  applianceIsLoading: observable,
  // appCalculating: observable,
  modelInputs: observable,
  fetchHomer: action,
  fetchAppliance: action,
  calculatedColumns: computed,
  combinedTable: computed,
  // combinedTableHeaders: computed,
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
  batteryNumFeatures: observable,
  batteryTrainingState: observable,
  batteryTrainLogs: observable,
  batteryWeightsList: observable,
  batteryFinalTrainSetLoss: observable,
  batteryValidationSetLoss: observable,
  batteryTestSetLoss: observable,
  trainBatteryModel: action.bound,
  batteryWeightsListSorted: computed,
  batteryBaselineLoss: computed,
})

export default MobxStore
// export let mobxStore = new MobxStore()
