import _ from 'lodash'
import { types } from 'mobx-state-tree'
import { setAncillaryEquipmentValues } from '../utils/setAncillaryEquipmentValues'
import { ancillaryEquipmentList } from '../utils/fileInfo'

//------------------------------------------------------------------------------
// Ancillary Equipment Store
//------------------------------------------------------------------------------
// There will be an array of these stores per appliance
export const AncillaryEquipmentStore = types
  .model({
    equipmentType: types.enumeration('equipmentType', [
      'powerConverter',
      'inverter',
      'vfd',
      'softStarter',
      'directOnlineStarter',
      'starDeltaStarter',
      'capacitorBank',
      'threeFourPointDcMotorStarter',
    ]),
    label: types.maybeNull(types.string),
    description: types.maybeNull(types.string),

    // values below are determined based on the appliance this ancillary
    // equipment store is attached to.
    enabled: types.boolean,
    compatibility: types.enumeration('compatibility', ['required', 'useful', 'notuseful', '']),
    compatibilityMessage: types.maybeNull(types.string),
    size: types.maybeNull(types.number), // size of appliance, in kW
    capex: types.number,
    estimatedCapex: types.number,
    capexAssignment: types.enumeration('capexAssignment', ['grid', 'appliance']),
    efficiency: types.number,
    estimatedEfficiency: types.number,
    defaultsAreSet: types.boolean,
  })
  .actions(self => ({
    // Called from an autorun, which will update this whenever activeGrid or
    // appliance attributes change
    updateValues(grid, appliance, ancillaryEquipmentList) {
      const results = setAncillaryEquipmentValues(
        grid,
        appliance,
        ancillaryEquipmentList,
        self.equipmentType
      )
      self.compatibility = results.compatibility
      self.compatibilityMessage = results.compatibilityMessage
      // self.size = results.size
      // self.estimatedCapex = results.estimatedCapex
      // self.estimatedEfficiency = results.estimatedEfficiency

      // This function will run on any change to it's arguments but we only want
      // defaults to be set once and then later can be overriden by user.
      if (!self.defaultsAreSet) {
        console.log('setting defaults')
        self.enabled = self.compatibility === 'required' // Required equipment will be auto-enabled
        self.capex = self.estimatedCapex
        self.efficiency = self.estimatedEfficiency
        self.defaultsAreSet = true
      }
    },

    // Set from checkboxes in UI
    setEnabledFromCheckbox(equipmentType, enabled) {
      self.enabledStates = { ...self.enabledStates, [equipmentType]: enabled }
    },
  }))
  .views(self => ({
    // List of selected ancillary equipment by label
    get enabledEquipmentList() {
      return _(self.enabledStates)
        .pickBy(val => val === true)
        .keys()
        .map(equipmentType => _.find(ancillaryEquipmentList, { equipmentType }).label)
        .value()
    },
  }))

export const initialAncillaryEquipmentState = {
  enabled: false,
  compatibility: '',
  compatibilityMessage: '',
  size: 0,
  capex: 0,
  estimatedCapex: 0,
  capexAssignment: 'appliance',
  efficiency: 0,
  estimatedEfficiency: 0,
  defaultsAreSet: false,
}
