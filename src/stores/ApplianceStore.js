import _ from 'lodash'
import { types, flow } from 'mobx-state-tree'
// import localforage from 'localforage'
import Papa from 'papaparse'
import {
  fetchSampleFile,
  fetchSnapshotApplianceFile,
  analyzeApplianceFile,
  csvOptions,
} from 'src/utils/importFileHelpers'

//
// -----------------------------------------------------------------------------
// Initial Appliance State
// -----------------------------------------------------------------------------
export const initialApplianceState = {
  enabled: false,
  fileInfo: {},
  fileData: [],
  fileLabel: '',
  fileDescription: '',
  fileErrors: [],
  fileWarnings: [],
  applianceType: '',
  capex: 0,
  capexTempValue: '',
  capexInputError: false,
  capexAssignment: 'appliance',
  fileIsSelected: false,
  isAnalyzingFile: false,
  applianceSaved: false,
}

//
// -----------------------------------------------------------------------------
// Appliance Store
// -----------------------------------------------------------------------------
export const ApplianceStore = types
  .model({
    enabled: types.boolean,
    fileInfo: types.frozen(),
    fileData: types.frozen(),
    fileLabel: types.string,
    fileDescription: types.string,
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
    applianceType: types.enumeration('applianceType', [
      'rice_mill',
      'maize_mill',
      'water_pump',
      'welder',
      'other',
      '',
    ]),
    capex: types.number,
    capexTempValue: types.frozen(),
    capexInputError: types.boolean,
    capexAssignment: types.enumeration('capexAssignment', ['grid', 'appliance']),
    powerType: types.enumeration('powerType', ['AC', 'DC', '']),
    phase: types.maybeNull(types.number),
    hasMotor: types.maybeNull(types.boolean),
    powerFactor: types.maybeNull(types.number),

    // Temporary UI state variables. May be moved into volatile state
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    applianceSaved: types.boolean,
  })
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },

    // These files come in through the file upload button
    handleApplianceFileUpload(rawFile) {
      self.fileIsSelected = true
      self.isAnalyzingFile = true
      const { name: fileName, size: fileSize, type: fileMimeType } = rawFile
      Papa.parse(rawFile, {
        ...csvOptions,
        complete: parsedFile => {
          const applianceAttrs = analyzeApplianceFile({
            parsedFile,
            fileName,
            fileSize,
            fileType: 'appliance',
            fileMimeType,
            isSamplefile: false,
          })
          self.updateAppliance(applianceAttrs)
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
        : yield fetchSnapshotApplianceFile(fileInfo)
      self.updateModel(analyzedFile)
      self.isAnalyzingFile = false
    }),

    updateModel(analyzedFile) {
      self.runInAction(() => {
        self.fileInfo = analyzedFile.fileInfo
        self.fileData = analyzedFile.fileData
        self.fileErrors = analyzedFile.fileErrors
        self.fileWarnings = analyzedFile.fileWarnings
        self.isAnalyzingFile = false
      })
    },

    handleLabelChange(event, data) {
      self.fileLabel = data.value
    },

    toggleAppliance(event) {
      event.preventDefault()
      self.enabled = !self.enabled
    },

    handleDescriptionChange(event, data) {
      event.preventDefault()
      self.fileDescription = data.value
    },

    handleCapexChange(event, data) {
      event.preventDefault()
      const inputError = !_.isFinite(parseInt(data.value, 10))
      self.capexInputError = inputError
      self.capexTempValue = data.value
      self.capex = inputError ? self.capex : parseInt(self.capexTempValue, 10)
    },

    handleCapexAssignmentChange(event, data) {
      event.preventDefault()
      self.capexAssignment = data.value
    },

    handleCancelUpload() {
      console.log('TODO: handleCancelUpload')
    },

    handleFileSave() {
      self.saveGridSnapshot()
    },
  }))
  .views(self => ({
    get showAnalyzedResults() {
      return self.fileIsSelected && !self.isAnalyzingFile
    },
    get fileLabels() {
      return _.map(self.availableAppliances, appliance => appliance.label)
    },
  }))
