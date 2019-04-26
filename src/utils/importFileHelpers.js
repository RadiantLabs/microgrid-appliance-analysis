import _ from 'lodash'
import Papa from 'papaparse'
import { analyzeHomerFile } from './analyzeHomerFile'
import { analyzeApplianceFile } from './analyzeApplianceFile'
import { csvOptions } from './helpers'
import { logger } from './logger'

export function filePathLookup(fileName, fileType, urlLocation) {
  const levelsDeep = urlLocation.pathname.split('/').length
  const relativePathCount = _.repeat('../', levelsDeep - 1)
  switch (fileType) {
    case 'homer':
      return relativePathCount + 'data/homer/' + fileName + '.csv'
    case 'appliance':
      return relativePathCount + 'data/appliances/' + fileName + '.csv'
    default:
      logger(`Need to pass fileType (homer, appliance) to filePathLookup`)
  }
}

// _____________________________________________________________________________
// Snapshots - unused for now
// _____________________________________________________________________________
// TODO: This function is being called from GridStore but doesn't do anything
// Figure out what it should be doing or fix the callee
export async function fetchSnapshotGridFile(fileInfo) {
  logger(
    `Hitting fetchSnapshotGridFile which isn't currently used for fileInfo: ${JSON.stringify(
      fileInfo
    )}`
  )
  return []
}

// TODO: This function is being called from ApplianceStore but doesn't do anything
// Figure out what it should be doing or fix the callee
export async function fetchSnapshotApplianceFile(fileInfo) {
  logger(
    `Hitting fetchSnapshotApplianceFile which isn't currently used for fileInfo: ${JSON.stringify(
      fileInfo
    )}`
  )
  return []
}

// _____________________________________________________________________________
// Fetch Homer or appliance usage profile files from samples.
// _____________________________________________________________________________
export async function fetchSampleFile(fileInfo, urlLocation) {
  const filePath = filePathLookup(fileInfo.name, fileInfo.fileType, urlLocation)
  try {
    const res = await fetch(filePath)
    const csv = await res.text()
    const parsedFile = Papa.parse(csv, csvOptions)
    if (!_.isEmpty(parsedFile.errors)) {
      logger(`Problem parsing grid CSV: ${JSON.stringify(parsedFile.errors)}`)
    }
    switch (fileInfo.fileType) {
      case 'homer':
        return analyzeHomerFile(parsedFile, fileInfo)
      case 'appliance':
        return analyzeApplianceFile(parsedFile, fileInfo)
      default:
        logger(
          `Expected either a 'homer' for 'appliance' file in fetchSampleFile. Got ${
            fileInfo.fileType
          }`
        )
    }
  } catch (error) {
    console.error(
      `File load fail for : ${filePath}. Make sure appliance CSV has all headers.`,
      error
    )
  }
}
