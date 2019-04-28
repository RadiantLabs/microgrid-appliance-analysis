import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Button, Header } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'

class TimeSegmentControls extends React.Component {
  render() {
    const {
      combinedTable,
      timeSegmentsMetric,
      timeSegmentsAggregation,
      timeSegmentsBy,
      handleTimeSegmentsMetricChange,
      handleTimeSegmentsAggregationChange,
      handleTimeSegmentsByChange,
    } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    console.log('load is active: ', timeSegmentsMetric, timeSegmentsMetric === 'load')
    return (
      <Grid>
        <Grid.Row style={{ paddingBottom: 0 }}>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Grid Metric</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact size="tiny">
              <Button
                value="load"
                onClick={handleTimeSegmentsMetricChange}
                active={timeSegmentsMetric === 'load'}>
                Load
              </Button>
              <Button
                value="unmetLoad"
                onClick={handleTimeSegmentsMetricChange}
                active={timeSegmentsMetric === 'unmetLoad'}>
                Unmet Load
              </Button>
              <Button
                value="excessProduction"
                onClick={handleTimeSegmentsMetricChange}
                active={timeSegmentsMetric === 'excessProduction'}>
                Excess Production
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row style={{ paddingBottom: 0 }}>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Aggregation</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact size="tiny">
              <Button
                value="average"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'average'}>
                Average
              </Button>
              <Button
                value="count"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'count'}>
                Count
              </Button>
              <Button
                value="sum"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'sum'}>
                Sum
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>By</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact size="tiny">
              <Button
                value="hourOfDay"
                onClick={handleTimeSegmentsByChange}
                active={timeSegmentsBy === 'hourOfDay'}>
                Hour of Day
              </Button>
              <Button
                value="dayOfWeek"
                onClick={handleTimeSegmentsByChange}
                active={timeSegmentsBy === 'dayOfWeek'}>
                Day of Week
              </Button>
              <Button
                value="month"
                onClick={handleTimeSegmentsByChange}
                active={timeSegmentsBy === 'month'}>
                Month
              </Button>
              <Button
                value="dayHour"
                onClick={handleTimeSegmentsByChange}
                active={timeSegmentsBy === 'dayHour'}>
                Day-Hour
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={7}>
            <Header as="h3">
              Loads by hour of year
              <Header sub>Each data point unit is average kW for 1 hour (kW*h)</Header>
            </Header>
          </Grid.Column>
          <Grid.Column width={9} />
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(TimeSegmentControls))
