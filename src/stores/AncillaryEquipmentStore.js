import { types } from 'mobx-state-tree'

/**
 * Ancillary Equipment Store
 */
export const AncillaryEquipmentStore = types
  .model({
    enabledStates: types.frozen(),
  })
  .actions(self => ({
    // onModelInputChange(fieldKey, value) {
    //   self[fieldKey] = value
    // },
  }))
