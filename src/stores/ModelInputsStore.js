import { types } from 'mobx-state-tree'

/**
 * Editable Field Store
 */
export const ModelInputsStore = types
  .model({
    // appliance inputs
    applianceNominalPower: types.maybeNull(types.number),
    dutyCycleDerateFactor: types.maybeNull(types.number),
    seasonalDerateFactor: types.maybeNull(types.number),
    wholesaleElectricityCost: types.maybeNull(types.number),
    productionUnitsPerKwh: types.maybeNull(types.number),
    revenuePerProductionUnits: types.maybeNull(types.number),
    revenuePerProductionUnitsUnits: types.maybeNull(types.string),

    // grid inputs
    retailElectricityPrice: types.maybeNull(types.number),
    unmetLoadCostPerKwh: types.maybeNull(types.number),
  })
  .actions(self => ({
    onModelInputChange(fieldKey, value) {
      self[fieldKey] = value
    },
  }))
