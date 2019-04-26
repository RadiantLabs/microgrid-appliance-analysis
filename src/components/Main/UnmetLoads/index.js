import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Table, Header } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getChartColors } from '../../../utils/constants'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'

class UnmetLoads extends React.Component {
  render() {
    const { summaryStats } = this.props.store
    if (_.isEmpty(summaryStats)) {
      return <LoaderSpinner />
    }
    const { allUnmetLoadHist } = summaryStats
    return (
      <div>
        <Header>
          Unmet Loads by Hour of Day
          <Header.Subheader>kW for 1 hour (kWh)</Header.Subheader>
        </Header>
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <BarChart data={allUnmetLoadHist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="hour_of_day" />
            <YAxis />
            <Tooltip content={<CustomToolTip />} />
            <Legend />
            <Bar dataKey="originalUnmetLoad" fill={getChartColors('originalUnmetLoad')} />
            <Bar dataKey="totalUnmetLoad" fill={getChartColors('totalUnmetLoad')} />
          </BarChart>
        </ResponsiveContainer>
        <Header as="h4" textAlign="center" style={{ marginTop: '10px' }}>
          Hour of Day
          <Header.Subheader>Hover over chart to see details.</Header.Subheader>
        </Header>
      </div>
    )
  }
}

export default inject('store')(observer(UnmetLoads))

const CustomToolTip = ({ active, payload, label }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  return (
    <div className="custom-tooltip">
      <p className="label">Hour of Day: {label}</p>
      <Table basic="very" compact>
        <Table.Body>
          {_.map(payload, element => {
            return (
              <Table.Row style={{ color: element.color }} key={element.dataKey}>
                <Table.Cell>{fieldDefinitions[element.dataKey].title}</Table.Cell>
                <Table.Cell textAlign="right">
                  {element.value} {fieldDefinitions[element.dataKey].units}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
