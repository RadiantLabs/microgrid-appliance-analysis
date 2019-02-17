import { types } from 'mobx-state-tree'

//
// -----------------------------------------------------------------------------
// Initial FileInfo State
// -----------------------------------------------------------------------------
export const initialFileInfoState = {
  id: '',
  type: '',
  timestamp: '',
  name: '',
  label: '',
  size: 0,
  description: '',
}

//
// -----------------------------------------------------------------------------
// FileInfo Store
// -----------------------------------------------------------------------------
export const FileInfoStore = types
  .model({
    id: types.string,
    type: types.enumeration('type', ['homer', 'appliance']),
    timestamp: types.string,
    name: types.string,
    label: types.string,
    size: types.number,
    description: types.string,
    isSample: types.boolean,
  })
  .actions(self => ({
    handleFileLabelChange(event, data) {
      self.label = data.value
    },
    handleFileDescriptionChange(event, data) {
      self.description = data.value
    },
  }))
