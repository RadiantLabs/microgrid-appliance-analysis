export const setHeaderStyles = (styles, rowIndex) => {
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
      ...{ borderTop: '1px solid rgba(34,36,38,.1)' },
    }
  }
  if (rowIndex === 1) {
    rowStyles = {
      ...rowStyles,
      ...{ borderBottom: '1px solid rgba(34,36,38,.1)' },
    }
  }
  return rowStyles
}
