import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Label, Icon, Header, Button } from 'semantic-ui-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
import { timeSegmentColors } from '../../../utils/constants'
import { fieldDefinitions } from '../../../utils/fieldDefinitions'
import { columnsToCalculate } from '../../../utils/calcTimeSegments'
import { timeSegmentLabels } from '../../../utils/constants'
import TimeSegmentControls from './TimeSegmentControls'
import { StackedArea } from './StackedArea'
import { StackedBar } from './StackedBar'

class TimeSegments extends React.Component {
  // I could set initial state based on incoming props
  state = {
    chartType: 'area', // could be bar
    stackOffset: 'none',
    load: new Set(['originalElectricLoadServed', 'newAppliancesLoad']),
    unmetLoad: new Set(['originalModeledUnmetLoad', 'newAppliancesUnmetLoad']),
    excessProduction: new Set(['originalModeledExcessProduction', 'newAppliancesExcessProduction']),
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
    const chartTitle = getChartTitle(timeSegmentsMetric, timeSegmentsAggregation, timeSegmentsBy)
    const isStacked = timeSegmentsMetric !== 'excessProduction'
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
                        disabled={!isStacked}
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
            <Grid.Column width={16}>{chartTitle}</Grid.Column>
          </Grid.Row>
        </Grid>

        {chartType === 'area' && (
          <StackedArea
            hist={hist}
            stackOffset={stackOffset}
            timeSegmentsBy={timeSegmentsBy}
            timeSegmentsAggregation={timeSegmentsAggregation}
            isStacked={isStacked}
            columns={columns}
            show={show}
          />
        )}

        {chartType === 'bar' && (
          <StackedBar
            hist={hist}
            stackOffset={stackOffset}
            timeSegmentsBy={timeSegmentsBy}
            timeSegmentsAggregation={timeSegmentsAggregation}
            isStacked={isStacked}
            columns={columns}
            show={show}
          />
        )}

        <p> </p>

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

function getChartTitle(metric, aggregation, by) {
  const title = `${timeSegmentLabels[aggregation]} ${timeSegmentLabels[metric]} by ${
    timeSegmentLabels[by]
  }`
  const isStacked = metric === 'load' || metric === 'unmetLoad'
  const isNotStacked = metric === 'excessProduction'
  const stackedMsg = (
    <span>
      Additional appliances will increase the {_.toLower(timeSegmentLabels[metric])}, so in this
      chart it is stacked on top of the original {_.toLower(timeSegmentLabels[metric])}
    </span>
  )
  const notStackedMsg = (
    <span>
      Additional appliances will decrease the {_.toLower(timeSegmentLabels[metric])} so it is
      subtracted from the original
    </span>
  )
  return (
    <Header as="h3">
      {title}
      {isStacked && <Header.Subheader>{stackedMsg}</Header.Subheader>}
      {isNotStacked && <Header.Subheader>{notStackedMsg}</Header.Subheader>}
    </Header>
  )
}

function legendLabelStyles(colorIndex) {
  return {
    borderBottom: `4px solid ${timeSegmentColors[colorIndex]}`,
    cursor: 'pointer',
  }
}
