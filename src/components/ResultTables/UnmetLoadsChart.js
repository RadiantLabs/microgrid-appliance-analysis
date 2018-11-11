import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../Loader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { getChartColors } from '../../utils/constants'

// TODO:
// Summary Stats
class UnmetLoadsChart extends React.Component {
  render() {
    const { summaryStats } = this.props.store
    if (_.isEmpty(summaryStats)) {
      return <LoaderSpinner />
    }
    const { unmetLoadHist } = summaryStats
    return (
      <div>
        <h5>Unmet Loads by Hour of Day (Average kW for 1 hour)</h5>
        <BarChart
          width={900}
          height={400}
          data={unmetLoadHist}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="hour_of_day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="additionalUnmetLoad"
            fill={getChartColors('additionalUnmetLoad')}
          />
          <Bar
            dataKey="newTotalUnmetLoad"
            fill={getChartColors('newTotalUnmetLoad')}
          />
        </BarChart>
      </div>
    )
  }
}

export default inject('store')(observer(UnmetLoadsChart))
