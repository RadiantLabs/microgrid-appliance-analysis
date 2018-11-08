// Non-mutating array insert
export const arrayInsert = (arr, item, index) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}
