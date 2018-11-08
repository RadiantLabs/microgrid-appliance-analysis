import _ from 'lodash'
// import { toJS } from 'mobx'

// Non-mutating array insert
export const arrayInsert = (arr, item, index) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}

export const filterNums = (table, key) => {
  return _.filter(_.map(table, key), _.isNumber)
}

// Pass in an array of objects and a key, finds the min value for that key.
// Note: _.minBy doesn't work when there are strings
export const findColMin = (table, key) => {
  return _.min(filterNums(table, key))
}

export const findColMax = (table, key) => {
  return _.max(filterNums(table, key))
}

// Need to convert header titles:
// const snake = 'generic_1_k_wh_lead_acid_asm_energy_content'
// const camel = 'generic1KWhLeadAcidAsmEnergyContent'
