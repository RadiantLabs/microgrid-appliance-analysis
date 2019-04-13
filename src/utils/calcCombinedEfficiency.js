import _ from 'lodash'

// For any given appliance, there may be 0 or more ancillary equipment items.
// Each equipment contributes an additional load based on thier efficiency being
// less than 100%.
// These efficiencies should multiply in the commutative way.
export function calcCombinedEfficiency(enabledAncillaryEquipment) {
  if (_.isEmpty(enabledAncillaryEquipment)) {
    return 1 // No ancillary equipment, no change in load (efficiency is 1)
  }

  const efficiencies = _(enabledAncillaryEquipment)
    .map('efficiencyRating')
    .compact()
    .value()

  return _.multiply(...efficiencies)
}
