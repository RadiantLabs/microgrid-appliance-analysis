import { tableColorsByKey } from '../utils/constants'

export const setHeaderStyles = (styles, rowIndex, tableName) => {
  let rowStyles = styles
  if (rowIndex === 0 || rowIndex === 1) {
    rowStyles = {
      ...rowStyles,
      ...{
        fontStyle: 'italic',
        backgroundColor: '#f9fafb',
      },
    }
  }
  if (rowIndex === 0) {
    rowStyles = {
      ...rowStyles,
      ...{
        borderTop: '1px solid rgba(34,36,38,.1)',
        borderLeft: '1px solid rgba(34,36,38,.1)',
        paddingLeft: '0.2rem',
        paddingRight: '0.2rem',
        overflowWrap: 'break-word',
      },
    }
  }
  if (rowIndex === 1) {
    rowStyles = {
      ...rowStyles,
      ...{
        borderBottom: `4px solid ${tableColorsByKey[tableName]}`,
        borderLeft: '1px solid rgba(34,36,38,.1)',
        paddingLeft: '0.2rem',
        paddingRight: '0.2rem',
      },
    }
  }

  return rowStyles
}
