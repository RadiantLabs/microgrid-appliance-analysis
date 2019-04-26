import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Grid, Button, Header } from 'semantic-ui-react'
import LoaderSpinner from '../../../components/Elements/Loader'

class TimeSegmentControls extends React.Component {
  state = { stackOffset: 'none' }

  handleMetricChange = (value, e) => {
    e.preventDefault()
    return null
  }

  handleTimeChange = (value, e) => {
    e.preventDefault()
    return null
  }

  handleStackClick = (value, e) => {
    e.preventDefault()
    this.setState({ stackOffset: value })
  }

  render() {
    const { combinedTable } = this.props.store
    if (_.isEmpty(combinedTable)) {
      return <LoaderSpinner />
    }
    const { stackOffset } = this.state
    return (
      <Grid>
        <Grid.Row style={{ paddingBottom: 0 }}>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>Select Metric</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact>
              <Button onClick={this.handleMetricChange.bind(null, 'avgLoad')}>Average Load</Button>
              <Button onClick={this.handleMetricChange.bind(null, 'unmetLoadCount')}>
                Unmet Load Count
              </Button>
              <Button onClick={this.handleMetricChange.bind(null, 'avgUnmetLoad')}>
                Average Unmet Load
              </Button>
              <Button onClick={this.handleMetricChange.bind(null, 'avgExcessProduction')}>
                Average Excess Production
              </Button>
            </Button.Group>
            <Button.Group basic compact style={{ float: 'right' }}>
              <Button
                onClick={this.handleStackClick.bind(null, 'none')}
                active={stackOffset === 'none'}>
                Normal Stacked
              </Button>
              <Button
                onClick={this.handleStackClick.bind(null, 'expand')}
                active={stackOffset === 'expand'}>
                100% Stacked
              </Button>
            </Button.Group>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={2} textAlign="right" style={{ marginTop: '6px' }}>
            <strong>By</strong>
          </Grid.Column>
          <Grid.Column width={14}>
            <Button.Group basic compact>
              <Button onClick={this.handleTimeChange.bind(null, 'hourOfDay')}>Hour of Day</Button>
              <Button onClick={this.handleTimeChange.bind(null, 'dayOfWeek')}>Day of Week</Button>
              <Button onClick={this.handleTimeChange.bind(null, 'month')}>Month</Button>
              <Button onClick={this.handleTimeChange.bind(null, 'dayHour')}>Day-Hour</Button>
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
