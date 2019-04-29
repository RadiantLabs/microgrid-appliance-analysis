import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Grid, Label, Icon } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import {
  XAxis,
  YAxis,
  Tooltip,
  // Bar,
  // BarChart,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { timeSegmentColors } from '../../../utils/constants'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
import { columnsToCalculate } from '../../../utils/calcTimeSegments'
import TimeSegmentControls from './TimeSegmentControls'

class TimeSegments extends React.Component {
  state = {
    load: {
      show: new Set(['Original Electrical Load Served', 'newAppliancesLoad']),
      stackOffset: 'none',
      chartType: 'area', // could be bar
    },
    unmetLoad: {
      show: new Set(['originalUnmetLoad', 'newAppliancesUnmetLoad']),
      stackOffset: 'none',
      chartType: 'area',
    },
    excessProduction: {
      show: new Set(['originalExcessProduction', 'newAppliancesExcessProduction']),
      stackOffset: 'none',
      chartType: 'area',
    },
  }

  handleLegendClick = (e, { value }) => {
    const { timeSegmentsMetric } = this.props.store
    this.setState((state, props) => {
      const show = state[timeSegmentsMetric].show
      return show.has(value) ? show.delete(value) : show.add(value)
    })
  }

  render() {
    const {
      timeSegments,
      timeSegmentsMetric,
      timeSegmentsAggregation,
      timeSegmentsBy,
    } = this.props.store
    if (_.isEmpty(timeSegments)) {
      return <LoaderSpinner />
    }
    const { show } = this.state[timeSegmentsMetric]
    // hist names look like: average_dayHour_hist
    const hist = timeSegments[`${timeSegmentsAggregation}_${timeSegmentsBy}_hist`]
    console.log('hist: ', hist)

    // First 2 elements in columns should be displayed in the chart. The third
    // element is the total, showed in the tooltip
    const columns = columnsToCalculate[timeSegmentsMetric]
    const stackOffset = 'none'
    return (
      <div>
        <TimeSegmentControls />
        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <AreaChart
            data={hist}
            stackOffset={stackOffset}
            margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
            <XAxis dataKey={timeSegmentsBy} />
            <YAxis />
            <Tooltip
              content={<CustomToolTip />}
              columns={columns}
              timeSegmentsBy={timeSegmentsBy}
            />
            {show.has(columns[0]) && (
              <Area
                type="monotone"
                dataKey={columns[0]}
                stackId="1"
                stroke={timeSegmentColors[0]}
                fill={timeSegmentColors[0]}
                fillOpacity="1"
              />
            )}
            {show.has(columns[1]) && (
              <Area
                type="monotone"
                dataKey={columns[1]}
                stackId="1"
                stroke={timeSegmentColors[1]}
                fill={timeSegmentColors[1]}
                fillOpacity="1"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16} textAlign="center">
              <Label
                basic
                value={columns[0]}
                onClick={this.handleLegendClick}
                style={legendLabelStyles(0)}
                size="large">
                <Icon name={`square outline${show.has(columns[0]) ? ' check' : ''}`} />
                {fieldDefinitions[columns[0]].title}
              </Label>
              <Label
                basic
                value={columns[1]}
                onClick={this.handleLegendClick}
                style={legendLabelStyles(1)}
                size="large">
                <Icon name={`square outline${show.has(columns[1]) ? ' check' : ''}`} />
                {fieldDefinitions[columns[1]].title}
              </Label>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default inject('store')(observer(TimeSegments))

// ___________________________________________________________________________
// Custom tooltip
// ___________________________________________________________________________
const CustomToolTip = ({ active, payload, label, columns, timeSegmentsBy }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  const totalColumnName = columns[2]
  const totalVal = payload[0]['payload'][totalColumnName]
  return (
    <div className="custom-tooltip">
      <p className="label">
        {fieldDefinitions[timeSegmentsBy].title}: {label}
      </p>
      <Table basic="very" compact>
        <Table.Body>
          {_.map(payload, element => {
            return (
              <Table.Row style={{ color: element.color }} key={element.dataKey}>
                <Table.Cell>{fieldDefinitions[element.dataKey].title}</Table.Cell>
                <Table.Cell textAlign="right">
                  {_.round(element.value, 2)} {fieldDefinitions[element.dataKey].units}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>{fieldDefinitions[totalColumnName].title}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              {totalVal}
              {fieldDefinitions[totalColumnName].units}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  )
}

function legendLabelStyles(colorIndex) {
  return {
    borderBottom: `4px solid ${timeSegmentColors[colorIndex]}`,
    cursor: 'pointer',
  }
}
