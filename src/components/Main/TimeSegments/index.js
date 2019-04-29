import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Grid, Label, Icon, Header, Button } from 'semantic-ui-react'
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
import { CustomToolTip } from './ToolTip'

class TimeSegments extends React.Component {
  state = {
    chartType: 'area', // could be bar
    stackOffset: 'none',
    load: new Set(['Original Electrical Load Served', 'newAppliancesLoad']),
    unmetLoad: new Set(['originalUnmetLoad', 'newAppliancesUnmetLoad']),
    excessProduction: new Set(['originalExcessProduction', 'newAppliancesExcessProduction']),
  }

  handleLegendClick = (e, { value }) => {
    e.preventDefault()
    const { timeSegmentsMetric } = this.props.store
    this.setState(state => {
      const show = state[timeSegmentsMetric]
      return show.has(value) ? show.delete(value) : show.add(value)
    })
  }

  handleStackClick = (e, { value }) => {
    e.preventDefault()
    this.setState({ stackOffset: value })
  }

  handleChartTypeClick = (e, { value }) => {
    e.preventDefault()
    this.setState({ chartType: value })
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
    const show = this.state[timeSegmentsMetric]
    const { stackOffset, chartType } = this.state

    // hist names look like: average_dayHour_hist
    const hist = timeSegments[`${timeSegmentsAggregation}_${timeSegmentsBy}_hist`]
    console.log('hist: ', hist)

    // First 2 elements in columns should be displayed in the chart. The third
    // element is the total, showed in the tooltip
    const columns = columnsToCalculate[timeSegmentsMetric]
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <TimeSegmentControls />
            </Grid.Column>
            <Grid.Column width={6}>
              <Grid>
                <Grid.Row style={{ paddingBottom: 0 }}>
                  <Grid.Column width={4} textAlign="right" style={{ marginTop: '6px' }}>
                    <strong>Stack</strong>
                  </Grid.Column>
                  <Grid.Column width={10}>
                    <Button.Group basic compact size="tiny">
                      <Button
                        value="none"
                        onClick={this.handleStackClick}
                        active={stackOffset === 'none'}>
                        Normal
                      </Button>
                      <Button
                        value="expand"
                        onClick={this.handleStackClick}
                        active={stackOffset === 'expand'}>
                        Percent
                      </Button>
                    </Button.Group>
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row style={{ paddingBottom: 0 }}>
                  <Grid.Column width={4} textAlign="right" style={{ marginTop: '6px' }}>
                    <strong>Chart Type</strong>
                  </Grid.Column>
                  <Grid.Column width={10}>
                    <Button.Group basic compact size="tiny">
                      <Button
                        value="area"
                        onClick={this.handleChartTypeClick}
                        active={chartType === 'area'}>
                        <Icon name="chart area" style={{ marginLeft: '4px' }} />
                      </Button>
                      <Button
                        value="bar"
                        onClick={this.handleChartTypeClick}
                        active={chartType === 'bar'}>
                        <Icon name="chart bar" style={{ marginLeft: '4px' }} />
                      </Button>
                    </Button.Group>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>{getChartTitle()}</Grid.Column>
          </Grid.Row>
        </Grid>

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
// Misc
// ___________________________________________________________________________
function getChartTitle() {
  return (
    <Header as="h3">
      Loads by hour of year (TODO)
      <Header sub>Each data point unit is average kW for 1 hour (kW*h)</Header>
    </Header>
  )
}

function legendLabelStyles(colorIndex) {
  return {
    borderBottom: `4px solid ${timeSegmentColors[colorIndex]}`,
    cursor: 'pointer',
  }
}
