import _ from 'lodash'
import { IApplianceStore } from '../stores/ApplianceStore'

// type GenericObject = { [key: any]: any }

export function calcEnabledApplianceLabels(enabledAppliances: IApplianceStore): string {
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
