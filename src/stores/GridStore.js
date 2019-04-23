import _ from 'lodash'
import { types, flow, getParent } from 'mobx-state-tree'
import Papa from 'papaparse'
import prettyBytes from 'pretty-bytes'
import { getIsoTimestamp, removeFileExtension, calcAvgError, calcMaxError } from '../utils/helpers'
import { calcPredictedVsActual, calcReferenceLine } from '../utils/calcPredictedVsActual'
import { calcBatteryDebugData } from '../utils/calcBatteryDebugData'
import {
  csvOptions,
  analyzeHomerFile,
  fetchSampleFile,
  fetchSnapshotGridFile,
} from '../utils/importFileHelpers'

//
// -----------------------------------------------------------------------------
// Homer + Battery Kinetic Model Store
// -----------------------------------------------------------------------------
export const GridStore = types
  .model({
    isActive: types.boolean,
    fileInfo: types.frozen(),
    fileData: types.frozen(),
    label: types.string,
    description: types.string,
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
    pvType: types.string,
    powerType: types.enumeration('powerType', ['AC', 'DC', '']),
    batteryType: types.string,
    generatorType: types.string,
    wholesaleElectricityCost: types.maybeNull(types.number),
    retailElectricityPrice: types.maybeNull(types.number),
    unmetLoadCostPerKwh: types.maybeNull(types.number),

    batteryMinSoC: types.maybeNull(types.number),
    batteryMaxSoC: types.maybeNull(types.number),
    batteryMinEnergyContent: types.maybeNull(types.number),
    batteryMaxEnergyContent: types.maybeNull(types.number),
    batteryEstimatedMinEnergyContent: types.maybeNull(types.number),
    batteryEstimatedMaxEnergyContent: types.maybeNull(types.number),

    cardIsOpen: types.maybeNull(types.boolean),
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    gridSaved: types.boolean,
    batteryModelSaved: types.boolean,
    modelInputValues: types.frozen(),
    modelInputErrors: types.frozen(),
  })
  .volatile(self => ({}))
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },
    // onModelInputChange depends on inputs being validated by the InputField
    // before saving to the model. InputField uses fieldDefinitions for validation
    onModelInputChange(fieldKey, value, error) {
      const newModelInputValues = _.clone(self.modelInputValues)
      const newModelInputErrors = _.clone(self.modelInputErrors)
      newModelInputValues[fieldKey] = value
      newModelInputErrors[fieldKey] = error
      self.modelInputValues = newModelInputValues
      self.modelInputErrors = newModelInputErrors
    },
    onModelInputBlur(fieldKey, value, error) {
      if (!Boolean(error)) {
        self[fieldKey] = value === 0 ? 0 : value || ''
      } else {
        console.log('Value not saved to store')
      }
    },
    // These files come in through the file upload button
    handleGridFileUpload(rawFile) {
      self.fileIsSelected = true
      self.isAnalyzingFile = true
      const { name, size, type: mimeType } = rawFile
      const timeStamp = getIsoTimestamp()
      const fileInfo = {
        id: `${name}_${timeStamp}`,
        timeStamp,
        fileType: 'homer',
        name,
        size,
        isSample: false,
        mimeType,
      }
      Papa.parse(rawFile, {
        ...csvOptions,
        complete: parsedFile => {
          const analyzedFile = analyzeHomerFile(parsedFile, fileInfo, mimeType)
          const label = removeFileExtension(name)
          self.runInAction(() => {
            self.label = label
            self.modelInputValues = { ...self.modelInputValues, label }
            self.updateModel(analyzedFile)
          })
        },
        error: error => console.log('error: ', error),
      })
    },
    // These files come in from either samples or previously uploaded user files
    loadFile: flow(function* loadFile(fileInfo) {
      self.isAnalyzingFile = true
      const analyzedFile = self.fileInfo.isSample
        ? yield fetchSampleFile(fileInfo, window.location)
        : yield fetchSnapshotGridFile(fileInfo)
      self.updateModel(analyzedFile)
      self.isAnalyzingFile = false
    }),
    updateModel(analyzedFile) {
      self.runInAction(() => {
        self.fileInfo = analyzedFile.fileInfo
        self.fileData = analyzedFile.fileData
        self.fileErrors = analyzedFile.fileErrors
        self.fileWarnings = analyzedFile.fileWarnings
        self.powerType = analyzedFile.powerType
        self.pvType = analyzedFile.pvType
        self.batteryType = analyzedFile.batteryType
        self.generatorType = analyzedFile.generatorType
        self.batteryMinSoC = analyzedFile.batteryMinSoC
        self.batteryMaxSoC = analyzedFile.batteryMaxSoC
        self.batteryEstimatedMinEnergyContent = analyzedFile.batteryEstimatedMinEnergyContent
        self.batteryEstimatedMaxEnergyContent = analyzedFile.batteryEstimatedMaxEnergyContent
        self.batteryMinEnergyContent = analyzedFile.batteryEstimatedMinEnergyContent
        self.batteryMaxEnergyContent = analyzedFile.batteryEstimatedMaxEnergyContent
        self.modelInputValues = {
          ...self.modelInputValues,
          ...{
            batteryMinEnergyContent: analyzedFile.batteryEstimatedMinEnergyContent,
            batteryMaxEnergyContent: analyzedFile.batteryEstimatedMaxEnergyContent,
          },
        }
        self.isAnalyzingFile = false
      })
    },
    toggleCard(toggleState) {
      if (_.isBoolean(toggleState)) {
        self.cardIsOpen = toggleState
      } else {
        self.cardIsOpen = !Boolean(self.cardIsOpen)
      }
    },
  }))
  .views(self => ({
    get showAnalyzedResults() {
      if (getParent(self).viewedGridIsStaged) {
        return self.fileIsSelected && !self.isAnalyzingFile
      }
      return true
    },
    get batteryAvgErrorPct() {
      return calcAvgError(self.predictedVsActualBatteryValues, 'error')
    },
    get batteryMaxErrorPct() {
      return calcMaxError(self.predictedVsActualBatteryValues, 'error')
    },
    get prettyFileSize() {
      return prettyBytes(self.fileInfo.size)
    },
    get inputErrorList() {
      return _.compact(_.values(self.modelInputErrors))
    },
    get fileReadyToSave() {
      const hasNoErrors = _.size(self.inputErrorList) === 0
      return _.every([
        self.label,
        self.description,
        _.isFinite(self.wholesaleElectricityCost),
        _.isFinite(self.retailElectricityPrice),
        _.isFinite(self.batteryMinEnergyContent),
        _.isFinite(self.batteryMaxEnergyContent),
        hasNoErrors,
      ])
    },
    // TODO: Get rid of this. When plotting the predicted vs actual chart,
    // pass in the whole table (combinedTable or grid.fileData) and the props:
    // actual='originalBatteryEnergyContent' predicted='mlr'
    get predictedVsActualBatteryValues() {
      return calcPredictedVsActual(self.fileData)
    },
    // TODO: calculate this from the chart, using dynamic keys instead of 'actual' vs 'predicted'
    get predictedVsActualReferenceLine() {
      return calcReferenceLine(self.batteryMinEnergyContent, self.batteryMaxEnergyContent)
    },
    get batteryDebugData() {
      return calcBatteryDebugData(
        self.fileData,
        self.batteryMinEnergyContent,
        self.batteryMaxEnergyContent
      )
    },
  }))

//
// -----------------------------------------------------------------------------
// Initial Grid State
// -----------------------------------------------------------------------------

export const initialGridState = {
  isActive: false,
  fileInfo: {},
  fileData: [],
  label: '',
  description: '',
  fileErrors: [],
  fileWarnings: [],
  pvType: '',
  powerType: '',
  batteryType: '',
  generatorType: '',
  wholesaleElectricityCost: null,
  retailElectricityPrice: null,
  unmetLoadCostPerKwh: null,
  batteryMinSoC: null,
  batteryMaxSoC: null,
  batteryMinEnergyContent: null,
  batteryMaxEnergyContent: null,
  batteryEstimatedMinEnergyContent: null,
  batteryEstimatedMaxEnergyContent: null,
  batteryModelSaved: false,
  cardIsOpen: false,
  fileIsSelected: false,
  isAnalyzingFile: false,
  gridSaved: false,
  modelInputValues: {},
  modelInputErrors: {},
}

// saveModelSync(model) {
//   function handleSave(artifacts) {
//     console.log('artifacts: ', artifacts)
//     // ... do something with the artifacts ...
//     // const { modelTopology, weightSpecs, weightData } = artifacts
//     // TODO:
//     // 1. Save to localforage
//     // 2. Load model from localforage
//     // const model = await tf.loadModel(tf.io.fromMemory(modelTopology, weightSpecs, weightData))
//   }
//   const saveResult = model.save(tf.io.withSaveHandler(handleSave))
//   // handleSave()
//   return null
// },

// saveModel: flow(function* saveModel(model) {
//   // const savedModelLocalStorage = yield model.save(
//   //   'localstorage://microgridAppliances_test_saved_model'
//   // )
//   // const savedModelDownload = yield model.save(
//   //   'downloads://microgridAppliances_test_saved_model'
//   // )
// }),
