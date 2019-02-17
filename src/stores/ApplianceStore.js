import _ from 'lodash'
import { types, flow } from 'mobx-state-tree'
// import localforage from 'localforage'
import Papa from 'papaparse'
import { fetchFile, analyzeApplianceFile, csvOptions } from 'utils/importFileHelpers'

//
// -----------------------------------------------------------------------------
// Initial Appliance State
// -----------------------------------------------------------------------------
export const initialApplianceState = {
  applianceStoreName: '',
  fileIsSelected: false,
  isAnalyzingFile: false,
  applianceSaved: false,
  fileName: '',
  fileLabel: '',
  fileSize: 0,
  fileData: [],
  fileDescription: '',
  fileErrors: [],
  fileWarnings: [],
  applianceType: '',
}

//
// -----------------------------------------------------------------------------
// Appliance Store
// -----------------------------------------------------------------------------
export const ApplianceStore = types
  .model({
    // There are multiple appliance stores. applianceStoreName identifies them to different views
    applianceStoreName: types.enumeration('applianceStoreName', [
      'activeAppliance',
      'stagedAppliance',
      '',
    ]),

    // Temporary UI state variables. May be moved into volatile state
    fileIsSelected: types.boolean,
    isAnalyzingFile: types.boolean,
    applianceSaved: types.boolean,

    applianceType: types.enumeration('applianceType', [
      'rice_mill',
      'maize_mill',
      'water_pump',
      'welder',
      'other',
      '',
    ]),
    fileName: types.string,
    fileLabel: types.string,
    fileSize: types.number,
    fileData: types.frozen(),
    fileDescription: types.string,
    fileErrors: types.array(types.string),
    fileWarnings: types.array(types.string),
  })
  .actions(self => ({
    runInAction(fn) {
      return fn()
    },

    // These files come in through the file upload button
    // File form fields are updated in handlers below (handleFileLabelChange,
    // handleFileDescriptionChange)
    handleApplianceFileUpload(rawFile) {
      self.fileIsSelected = true
      self.isAnalyzingFile = true
      console.log('parsing appliance rawFile: ', rawFile)
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
    loadApplianceFile: flow(function* loadApplianceFile(applianceInfo) {
      self.isAnalyzingFile = true
      const parsedFile = yield fetchFile(applianceInfo, window.location)
      const { fileName, fileSize, fileType, isSamplefile } = applianceInfo
      const applianceAttrs = analyzeApplianceFile({
        parsedFile,
        fileName,
        fileSize,
        fileType,
        isSamplefile,
      })
      self.updateAppliance(applianceAttrs)
    }),

    updateAppliance(applianceAttrs) {
      self.runInAction(() => {
        self.fileData = applianceAttrs.fileData
        self.fileName = applianceAttrs.fileName
        self.fileSize = applianceAttrs.fileSize
        self.fileErrors = applianceAttrs.fileErrors
        self.fileWarnings = applianceAttrs.fileWarnings
        self.isAnalyzingFile = false
      })
    },

    handleFileLabelChange(event, data) {
      self.fileLabel = data.value
    },

    handleFileDescriptionChange(event, data) {
      self.fileDescription = data.value
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
