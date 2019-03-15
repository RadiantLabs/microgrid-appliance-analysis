import * as React from 'react'
import { BarChart, Bar, XAxis, Tooltip } from 'recharts'
import _ from 'lodash'
import { checkKey } from '../../../utils/helpers'

// This is unused at the moment
export const TinyBarChart = props => {
  const { data, x, y, domain } = props
  if (_.isEmpty(data)) {
    return <span>Loading</span>
  }

  // Check to see if x, y key is in array. Can this be turned off from production?
  // Or just use Typescript
  checkKey(data, x)
  checkKey(data, y)

  return (
    <BarChart width={150} height={70} data={data} margin={{ top: 0, right: 0, bottom: 0, left: 5 }}>
      <XAxis dataKey={x} type="number" domain={domain} height={20} tick={{ fontSize: 10 }} />
      <Tooltip />
      <Bar dataKey={y} fill="#8884d8" />
    </BarChart>
  )
}
