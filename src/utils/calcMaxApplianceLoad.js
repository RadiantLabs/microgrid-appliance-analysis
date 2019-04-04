import _ from 'lodash'

export function calcMaxApplianceLoad(combinedTable) {
  const maxLoadRecord = _.maxBy(combinedTable, 'totalElectricalLoadServed')
  return {
    maxLoadValue: maxLoadRecord['totalElectricalLoadServed'],
    maxLoadFirstHour: maxLoadRecord['hour'],
  }
}
