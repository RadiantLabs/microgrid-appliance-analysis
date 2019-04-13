import { saveAs } from 'file-saver'
import Papa from 'papaparse'

export function saveFile(tableData, fileName) {
  const csv = Papa.unparse(tableData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, fileName)
}
