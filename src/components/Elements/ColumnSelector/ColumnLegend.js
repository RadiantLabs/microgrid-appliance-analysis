import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { tableColorsByKey } from '../../../utils/constants'

/**
 * Column Header Legend
 */
const setLegendStyles = tableName => {
  return {
    display: 'inline-block',
    paddingRight: '4px',
    marginRight: '6px',
    marginTop: '20px',
    fontStyle: 'italic',
    fontSize: '14px',
    lineHeight: 1.8,
    borderBottom: `2px solid ${tableColorsByKey[tableName]}`,
  }
}

export const ColumnLegend = inject('store')(
  observer(({ store }) => {
    return (
      <div>
        <div style={setLegendStyles('calculatedColumns')}>Calculated Columns</div>
        <div style={setLegendStyles('homer')}>HOMER Columns</div>
        <div style={setLegendStyles('appliance')}>Appliance Columns</div>
      </div>
    )
  })
)
