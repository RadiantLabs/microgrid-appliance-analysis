import * as React from 'react'
import { BarChart, Bar, XAxis, Tooltip } from 'recharts'
import _ from 'lodash'

export const TinyBarChart = props => {
  const { data, x, y } = props
  if (_.isEmpty(data)) {
    return <span>Loading</span>
  }
  // TODO: Check to see if x, y key is in array
  // TODO: pass in range to be 24 hours
  return (
    <BarChart width={150} height={70} data={data} margin={{ top: 0, right: 0, bottom: 0, left: 5 }}>
      <XAxis dataKey={x} type="number" domain={[0, 23]} height={20} tick={{ fontSize: 10 }} />
      <Tooltip />
      <Bar dataKey={y} fill="#8884d8" />
    </BarChart>
  )
}
