import _ from 'lodash'
import { types } from 'mobx-state-tree'
import { setAncillaryEquipmentValues } from '../utils/setAncillaryEquipmentValues'

//
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
    compatibility: types.maybeNull(
      types.enumeration('compatibility', ['required', 'useful', 'notuseful'])
    ),
    compatibilityMessage: types.maybeNull(types.string),
    equipmentSize: types.maybeNull(types.number), // size of appliance, in kW
    capex: types.maybeNull(types.number),
    estimatedCapex: types.maybeNull(types.number),
    capexAssignment: types.enumeration('capexAssignment', ['grid', 'appliance']),
    efficiency: types.maybeNull(types.number),
    estimatedEfficiency: types.maybeNull(types.number),
    defaultsAreSet: types.boolean,
  })
  .actions(self => ({
    // Called from an autorun, which will update this whenever activeGrid or
    // appliance attributes change
    updateValues(ruleValues) {
      const results = setAncillaryEquipmentValues(ruleValues)
      self.compatibility = results.compatibility
      self.compatibilityMessage = results.compatibilityMessage
      self.equipmentSize = results.equipmentSize
      self.estimatedCapex = results.estimatedCapex
      self.estimatedEfficiency = results.estimatedEfficiency

      // This function will run on any change to it's arguments but we only want
      // defaults to be set once and then later can be overriden by user.
      if (self.readyToSetDefaults) {
        self.enabled = self.compatibility === 'required' // Required equipment will be auto-enabled
        self.capex = self.estimatedCapex
        self.efficiency = self.estimatedEfficiency
        self.defaultsAreSet = true
      }
    },

    // Set from checkboxes in UI
    toggleEnabled() {
      self.enabled = !self.enabled
    },
  }))
  .views(self => ({
    get readyToSetDefaults() {
      return _.every([
        !self.defaultsAreSet,
        self.compatibility,
        self.equipmentSize,
        self.estimatedCapex,
        self.estimatedEfficiency,
      ])
    },
  }))

export const initialAncillaryEquipmentState = {
  enabled: false,
  compatibility: null,
  compatibilityMessage: '',
  equipmentSize: null,
  capex: null,
  estimatedCapex: null,
  capexAssignment: 'appliance',
  efficiency: null,
  estimatedEfficiency: null,
  defaultsAreSet: false,
}
