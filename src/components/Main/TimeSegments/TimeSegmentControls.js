import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Button, Header } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'

class TimeSegmentControls extends React.Component {
  handleMetricChange = (e, { value }) => {
    e.preventDefault()
    console.log('value: ', value)
    return null
  }

  handleAggregationChange = (e, { value }) => {
    e.preventDefault()
    console.log('value: ', value)
    return null
  }

  handleByTimeChange = (e, { value }) => {
    e.preventDefault()
    console.log('value: ', value)
    return null
  }

  render() {
    const { combinedTable } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    return (
      <Grid>
        <Grid.Row style={{ paddingBottom: 0 }}>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Grid Metric</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact size="tiny">
              <Button value="load" onClick={this.handleMetricChange}>
                Load
              </Button>
              <Button value="unmetLoad" onClick={this.handleMetricChange}>
                Unmet Load
              </Button>
              <Button value="excessProduction" onClick={this.handleMetricChange}>
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
              <Button value="average" onClick={this.handleAggregationChange}>
                Average
              </Button>
              <Button value="count" onClick={this.handleAggregationChange}>
                Count
              </Button>
              <Button value="sum" onClick={this.handleAggregationChange}>
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
              <Button value="hourOfDay" onClick={this.handleByTimeChange}>
                Hour of Day
              </Button>
              <Button value="dayOfWeek" onClick={this.handleByTimeChange}>
                Day of Week
              </Button>
              <Button value="month" onClick={this.handleByTimeChange}>
                Month
              </Button>
              <Button value="dayHour" onClick={this.handleByTimeChange}>
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
