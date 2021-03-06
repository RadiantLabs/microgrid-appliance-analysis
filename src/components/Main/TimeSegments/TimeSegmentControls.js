import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Button } from 'semantic-ui-react'
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
    return (
      <Grid>
        <Grid.Row style={{ paddingBottom: 0 }}>
          <Grid.Column width={4} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Grid Metric</strong>
          </Grid.Column>
          <Grid.Column width={10}>
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
          <Grid.Column width={4} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Aggregation</strong>
          </Grid.Column>
          <Grid.Column width={10}>
            <Button.Group basic compact size="tiny">
              <Button
                value="average"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'average'}>
                Average
              </Button>
              <Button
                value="sum"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'sum'}>
                Sum
              </Button>
              <Button
                value="count"
                onClick={handleTimeSegmentsAggregationChange}
                active={timeSegmentsAggregation === 'count'}>
                Count
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={4} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>By</strong>
          </Grid.Column>
          <Grid.Column width={10}>
            <Button.Group basic compact size="tiny" style={{ minWidth: '380px' }}>
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
                value="hourOfWeek"
                onClick={handleTimeSegmentsByChange}
                active={timeSegmentsBy === 'hourOfWeek'}>
                Hour of Week
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default inject('store')(observer(TimeSegmentControls))
