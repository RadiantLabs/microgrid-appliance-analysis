import _ from 'lodash'

export function calcAncillaryEquipmentCosts(enabledAppliances) {
  const ancillaryEquipment = _.flatMap(enabledAppliances, appliance => {
    return appliance.ancillaryEquipment
  })
  const assignedToGrid = _.filter(ancillaryEquipment, equip => {
    return equip.enabled && equip.capexAssignment === 'grid'
  })
  const assignedToAppliance = _.filter(ancillaryEquipment, equip => {
    return equip.enabled && equip.capexAssignment === 'appliance'
  })
  return {
    ancillaryCapexAssignedToGrid: _.sumBy(assignedToGrid, 'capex'),
    ancillaryCapexAssignedToAppliance: _.sumBy(assignedToAppliance, 'capex'),
  }
}
