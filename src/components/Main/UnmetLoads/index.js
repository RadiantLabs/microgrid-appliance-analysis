import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getChartColors, greyColors } from '../../../utils/constants'

const headerStyle = { color: greyColors[1], fontWeight: '200', fontSize: '16px' }

class UnmetLoads extends React.Component {
  render() {
    const { summaryStats } = this.props.store
    if (_.isEmpty(summaryStats)) {
      return <LoaderSpinner />
    }
    const { allUnmetLoadHist } = summaryStats

    return (
      <div>
        <h3>
          Unmet Loads by Hour of Day <small style={headerStyle}>kW for 1 hour</small>
        </h3>
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <BarChart
            // width={900}
            // height={400}
            data={allUnmetLoadHist}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="hour_of_day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              stackId="a"
              dataKey="originalUnmetLoad"
              fill={getChartColors('originalUnmetLoad')}
            />
            <Bar
              stackId="a"
              dataKey="additionalUnmetLoad"
              fill={getChartColors('additionalUnmetLoad')}
            />
            <Bar dataKey="newTotalUnmetLoad" fill={getChartColors('newTotalUnmetLoad')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(UnmetLoads))
