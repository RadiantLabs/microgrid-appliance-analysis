import _ from 'lodash'
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'
import { createBrowserHistory } from 'history'
import localforage from 'localforage'
import {
  sampleGridFileInfos,
  sampleApplianceFiles,
  ancillaryEquipmentList,
} from '../utils/fileInfo'

// Import Other Stores:
import { MainStore } from './MainStore'
import { GridStore, initialGridState } from './GridStore'
import { ApplianceStore, initialApplianceState } from './ApplianceStore'
import { AncillaryEquipmentStore, initialAncillaryEquipmentState } from './AncillaryEquipmentStore'

// -----------------------------------------------------------------------------
// Initialize Mobx State Tree Store
// -----------------------------------------------------------------------------
//Hook React Router up to Store
const routerModel = RouterModel.create()

//Hook up router model to browser history object. Used in App.js
export const history = syncHistoryWithStore(createBrowserHistory(), routerModel)

function freshInitialization() {
  const initGridFileId = '12-50 Oversize 20_2019-02-16T20:34:25.937-07:00' // TODO: Check localforage
  const allGridFileInfos = sampleGridFileInfos.concat([]) // TODO: concat fileInfos from localforage
  const enabledApplianceFileId = 'rice_mill_usage_profile_2019-02-16T20:33:55.583-07:00' // TODO: Check localforage
  // const enabledApplianceFileId = 'maize_mill_usage_profile_1_20_2019-02-16T20:34:25.937-07:00'
  const applianceFileInfos = sampleApplianceFiles.concat([]) // TODO: concat fileInfos from localforage

  return {
    availableGrids: _.map(allGridFileInfos, gridInfo => {
      return GridStore.create({
        ...initialGridState,
        ...{ isActive: gridInfo.id === initGridFileId },
        ...{ ...gridInfo.attributes },
        ...{ modelInputValues: { ...gridInfo.attributes } },
        ...{ fileInfo: _.omit(gridInfo, ['attributes']) },
      })
    }),
    stagedGrid: null,
    viewedGridId: initGridFileId,
    appliancesAreLoading: true,
    appliances: _.map(applianceFileInfos, applianceInfo => {
      return ApplianceStore.create({
        ...initialApplianceState,

        enabled: applianceInfo.id === enabledApplianceFileId,
        // enabled: true, // for debugging

        ...{ applianceType: applianceInfo.applianceType },
        ...{ ...applianceInfo.attributes },
        ...{ modelInputValues: { ...applianceInfo.attributes } },
        ...{ fileInfo: _.omit(applianceInfo, ['attributes']) },
        ...{
          ancillaryEquipment: _.map(ancillaryEquipmentList, ancillaryEquip => {
            return AncillaryEquipmentStore.create({
              ...ancillaryEquip,
              ...initialAncillaryEquipmentState,
            })
          }),
        },
      })
    }),
    viewedApplianceId: enabledApplianceFileId,
    excludedTableColumns: [],
    router: routerModel,
    appIsSaved: true,
    appIsSavedTimestamp: null,
  }
}

export async function getInitialState() {
  return localforage
    .getItem('latest')
    .then(latestSnapshot => {
      const isFreshState = !MainStore.is(latestSnapshot)
      return {
        initialState: isFreshState ? freshInitialization() : latestSnapshot,
        isFreshState,
      }
    })
    .catch(err => {
      console.log(err)
      throw new Error(err)
    })
}
