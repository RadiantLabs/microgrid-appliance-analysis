import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Icon } from 'semantic-ui-react'
import { saveFile } from '../../../utils/saveFile'

export const FileSaver = inject('store')(
  observer(({ store }) => {
    const { combinedTable } = store
    return (
      <div
        style={{ cursor: 'pointer' }}
        onClick={saveFile.bind(null, combinedTable, 'grid_with_appliances.csv')}>
        Download CSV
        <br />
        <Icon.Group size="large">
          <Icon name="file outline" />
          <Icon
            corner="bottom right"
            name="arrow circle down"
            style={{ transform: 'rotate(90deg)' }}
          />
        </Icon.Group>
      </div>
    )
  })
)
