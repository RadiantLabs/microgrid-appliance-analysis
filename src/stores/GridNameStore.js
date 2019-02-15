import { types } from 'mobx-state-tree'

//
// -----------------------------------------------------------------------------
// Small model of grid meta-data like name, description, ...
// -----------------------------------------------------------------------------
export const GridNameStore = types.model({
  // There are multiple grid stores. gridName identifies them to different views
  fileName: types.string,
  fileDescription: types.string,
  fileSize: types.number,
  isSample: types.boolean,
  defaultOnLoad: types.boolean,
})
