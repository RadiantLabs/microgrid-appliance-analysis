import _ from 'lodash'

export function calcEnabledApplianceLabels(enabledAppliances) {
  const labels = _.map(enabledAppliances, appliance => appliance.label)
  const labelCount = _.size(labels)
  if (labelCount === 0) {
    return 'No Appliances Selected'
  }
  if (labelCount > 2) {
    return `${labelCount} Appliances Selected`
  }
  return labels.join(', ')
}
