import _ from 'lodash'
import { types, getParent } from 'mobx-state-tree'
import {
  getAncillaryEquipmentStatus,
  setAncillaryEquipmentEnabledFromStatus,
} from '../utils/ancillaryEquipmentRules'
import { ancillaryEquipmentList } from '../utils/fileInfo'

/**
 * Ancillary Equipment Store
 */
export const AncillaryEquipmentStore = types
  .model({
    enabledStates: types.frozen(),
  })
  .actions(self => ({
    // Set from checkboxes in UI
    setAncillaryEquipmentEnabledFromCheckbox(equipmentType, enabled) {
      self.enabledStates[equipmentType] = enabled
    },

    // Required equipment will be auto-enabled
    // Call from autorun in constructor when ancillaryEquipmentStatus changes
    setEquipmentEnabledFromStatus(equipmentStatus) {
      self.enabledStates = setAncillaryEquipmentEnabledFromStatus(
        equipmentStatus,
        self.enabledStates
      )
    },

    // Set from checkboxes in UI
    setEnabledFromCheckbox(equipmentType, enabled) {
      self.enabledStates = { ...self.enabledStates, [equipmentType]: enabled }
    },
  }))
  .views(self => ({
    // Status is whether the equipment is required, usefor or not useful based on rules
    get equipmentStatus() {
      return getAncillaryEquipmentStatus(
        getParent(self).activeGrid,
        getParent(self).activeAppliance,
        ancillaryEquipmentList
      )
    },

    // List of selected ancillary equipment by label
    get enabledEquipmentList() {
      return _(self.enabledStates)
        .pickBy(val => val === true)
        .keys()
        .map(equipmentType => _.find(ancillaryEquipmentList, { equipmentType }).label)
        .value()
    },
  }))
