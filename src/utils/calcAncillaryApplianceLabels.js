import _ from 'lodash'

export function calcAncillaryApplianceLabels(enabledAppliances) {
  const enabledCount = _.size(enabledAppliances)
  if (enabledCount === 0) {
    return 'No equipment selected'
  }
  if (enabledCount === 1) {
    const labels = enabledAppliances[0].enabledAncillaryEquipmentLabels
    return _.isEmpty(labels) ? '-' : labels.join(', ')
  }
  return 'Multiple Appliances'

  // const enabledEquipment = _.map(enabledAppliances, appliance => {
  //   return appliance.enabledAncillaryEquipment
  // })
  // debugger
  // return ''
}
