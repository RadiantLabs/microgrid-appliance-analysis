import { types } from 'mobx-state-tree'

/**
 * Editable Field Store
 */
export const ModelInputsStore = types
  .model({
    // TODO: rename applianceNominalPower
    applianceNominalPower: types.maybeNull(types.number),
    dutyCycleDerateFactor: types.maybeNull(types.number),
    seasonalDerateFactor: types.maybeNull(types.number),
    wholesaleElectricityCost: types.maybeNull(types.number),
    unmetLoadCostPerKwh: types.maybeNull(types.number),
    retailElectricityPrice: types.maybeNull(types.number),
    productionUnitsPerKwh: types.maybeNull(types.number),
    revenuePerProductionUnits: types.maybeNull(types.number),
    revenuePerProductionUnitsUnits: types.maybeNull(types.string),
  })
  .actions(self => ({
    onModelInputChange(fieldKey, value) {
      self[fieldKey] = value
    },
  }))
