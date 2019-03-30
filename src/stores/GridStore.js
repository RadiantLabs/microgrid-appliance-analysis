import _ from 'lodash'
import { types, flow, getSnapshot, getParent } from 'mobx-state-tree'
import localforage from 'localforage'
import Papa from 'papaparse'
import prettyBytes from 'pretty-bytes'
import { getIsoTimestamp, removeFileExtension, calcAvgError, calcMaxError } from '../utils/helpers'
import { calcPredictedVsActual, calcReferenceLine } from '../utils/calcPredictedVsActual'
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

    // Temporary UI state variables. Maybe move into volatile state?
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
          const gridAttrs = analyzeHomerFile(parsedFile, fileInfo, mimeType)
          self.runInAction(() => {
            self.label = removeFileExtension(name)
            self.updateModel({ ...gridAttrs })
          })
        },
        error: error => {
          console.log('error: ', error)
        },
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
        self.batteryMinEnergyContent = analyzedFile.batteryMinEnergyContent
        self.batteryMaxEnergyContent = analyzedFile.batteryMaxEnergyContent
        self.isAnalyzingFile = false
      })
    },

    saveGridSnapshot() {
      const gridSnapshot = _.omit(getSnapshot(self), ['batteryModel'])
      localforage.setItem('microgridAppliances.stagedGrid', gridSnapshot).then(() => {
        self.runInAction(() => {
          self.gridSaved = true
        })
      })
    },
  }))
  .views(self => ({
    get showAnalyzedResults() {
      if (getParent(self).viewedGridIsStaged) {
        return self.fileIsSelected && !self.isAnalyzingFile
      }
      return true
    },
    get predictedVsActualBatteryValues() {
      return calcPredictedVsActual(self.fileData)
    },
    get predictedVsActualReferenceLine() {
      return calcReferenceLine(self.batteryMinEnergyContent, self.batteryMaxEnergyContent)
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
  batteryModelSaved: false,
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
