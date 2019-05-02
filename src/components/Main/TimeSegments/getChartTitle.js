import * as React from 'react'
import _ from 'lodash'
import { Header } from 'semantic-ui-react'
import { timeSegmentLabels } from '../../../utils/constants'

export function getChartTitle(metric, aggregation, by) {
  const title = `${timeSegmentLabels[aggregation]} ${timeSegmentLabels[metric]} by ${
    timeSegmentLabels[by]
  }`
  const isStacked = metric === 'load' || metric === 'unmetLoad'
  const isNotStacked = metric === 'excessProduction'
  const stackedMsg = (
    <span>
      Adding appliances will increase the {_.toLower(timeSegmentLabels[metric])}, so in this chart
      it is stacked on top of the original {_.toLower(timeSegmentLabels[metric])}
    </span>
  )
  const notStackedMsg = (
    <span>
      Adding appliances will decrease the {_.toLower(timeSegmentLabels[metric])}, so in this chart
      it is drawn below the original
    </span>
  )
  return (
    <Header as="h3">
      {title}
      <Header.Subheader style={subStyle}>
        {getAggregationMessage(metric, aggregation, by)}
      </Header.Subheader>
      {isStacked && <Header.Subheader style={subStyle}>{stackedMsg}</Header.Subheader>}
      {isNotStacked && <Header.Subheader style={subStyle}>{notStackedMsg}</Header.Subheader>}
    </Header>
  )
}

function getAggregationMessage(metric, aggregation, by) {
  if (aggregation === 'count') {
    return `For example, hovering over ${
      messageByLookup[by]
    } shows you the count of hours per year we have ${countMessageMetricLookup[metric]} at ${
      messageByLookup[by]
    }.`
  }
  return `For example, hovering over ${messageByLookup[by]} shows you the ${aggregation} of the ${
    messageMetricLookup[metric]
  } components for every ${messageByLookup[by]} in a year`
}

const messageMetricLookup = {
  load: 'load',
  unmetLoad: 'unmet load',
  excessProduction: 'excess production',
}
const messageByLookup = {
  hourOfDay: '9am',
  dayOfWeek: 'Wednesday',
  month: 'April',
  hourOfWeek: 'TODO',
}

const countMessageMetricLookup = {
  load: 'any load',
  unmetLoad: 'an unmet load',
  excessProduction: 'an excess production',
}

const subStyle = {
  marginTop: '4px',
}
