import _ from 'lodash'
import { types, flow } from 'mobx-state-tree'
// import localforage from 'localforage'
import Papa from 'papaparse'
import {
  fetchSampleFile,
  fetchSnapshotApplianceFile,
  analyzeApplianceFile,
  csvOptions,
} from '../utils/importFileHelpers'
import { calculateApplianceColumns } from '../utils/calculateApplianceColumns'
import { calculateApplianceSummaryStats } from '../utils/CalculateApplianceSummaryStats'

//
// -----------------------------------------------------------------------------
// Appliance Store
// -----------------------------------------------------------------------------
export const ApplianceStore = types
  .model({
    enabled: types.boolean,
    fileInfo: types.frozen(),
    fileData: types.frozen(),
    label: types.string,
    description: types.string,
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
    capexAssignment: types.enumeration('capexAssignment', ['grid', 'appliance']),
    powerType: types.enumeration('powerType', ['AC', 'DC', '']),
    phase: types.maybeNull(types.number),
    hasMotor: types.maybeNull(types.boolean),
    powerFactor: types.maybeNull(types.number),
    nominalPower: types.maybeNull(types.number),
    dutyCycleDerateFactor: types.maybeNull(types.number),
    seasonalDerateFactor: types.maybeNull(types.number),
    productionUnitType: types.maybeNull(types.string),
    productionUnitsPerKwh: types.maybeNull(types.number),
    revenuePerProductionUnits: types.maybeNull(types.number),
    revenuePerProductionUnitsUnits: types.maybeNull(types.string),

    // Temporary UI state variables. May be moved into volatile state
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    applianceSaved: types.boolean,
    modelInputValues: types.frozen(),
    modelInputErrors: types.frozen(),
  })
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

    toggleAppliance(event) {
      event.preventDefault()
      self.enabled = !self.enabled
    },

    handleCapexAssignmentChange(event, data) {
      event.preventDefault()
      self.capexAssignment = data.value
    },

    handlePowerTypeChange(event, data) {
      event.preventDefault()
      self.powerType = data.value
    },

    handlePhaseChange(event, data) {
      event.preventDefault()
      self.phase = data.value
    },

    handleHasMotorChange(event, data) {
      event.preventDefault()
      self.hasMotor = data.value
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

    get calculatedApplianceColumns() {
      return calculateApplianceColumns(self)
    },

    get applianceSummaryStats() {
      return calculateApplianceSummaryStats(self.calculatedApplianceColumns)
    },
  }))

//
// -----------------------------------------------------------------------------
// Initial Appliance State
// -----------------------------------------------------------------------------
export const initialApplianceState = {
  enabled: false,
  fileInfo: {},
  fileData: [],
  label: '',
  description: '',
  fileErrors: [],
  fileWarnings: [],
  applianceType: '',
  capex: 0,
  capexTempValue: '',
  capexInputError: false,
  capexAssignment: 'appliance',
  powerType: 'AC',
  phase: null,
  hasMotor: null,
  powerFactor: null,
  nominalPower: null,
  dutyCycleDerateFactor: null,
  seasonalDerateFactor: null,
  productionUnitType: null,
  productionUnitsPerKwh: null,
  revenuePerProductionUnits: null,
  revenuePerProductionUnitsUnits: '',
  fileIsSelected: false,
  isAnalyzingFile: false,
  applianceSaved: false,
  modelInputValues: {},
  modelInputErrors: {},
}
