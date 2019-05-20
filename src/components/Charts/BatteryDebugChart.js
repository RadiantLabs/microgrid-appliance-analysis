import React, { Component } from 'react'
import _ from 'lodash'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts'
import { observer, inject } from 'mobx-react'
import { Table, Form, Checkbox, Grid, Header } from 'semantic-ui-react'
import { chartColorsByIndex } from '../../utils/constants'
import { asPercent } from '../../utils/helpers'
import PredictedVsActual from '../Charts/PredictedVsActual'
import BatteryLossCoeffChart from '../Charts/BatteryLossCoeffChart'

const chartLines = [
  'originalBec',
  'naive',
  'naiveClamped',
  'lossCoeffClamped',
  'mlr',
  'mlrPosNeg',
  'poly',
  'manualPoly',
]

class BatteryDebugChart extends Component {
  state = {
    checkedItems: new Set(['originalBec', 'lossCoeffClamped']),
    radioSelection: 'lossCoeffClamped',
  }

  handleCheckedChange = (e, { value }) => {
    this.setState(state => {
      const items = state.checkedItems
      items.has(value) ? items.delete(value) : items.add(value)
      return {
        checkedItems: items,
      }
    })
  }

  handleRadioChange = (e, { value }) => {
    this.setState(state => {
      return {
        radioSelection: value,
      }
    })
  }

  render() {
    const { checkedItems, radioSelection } = this.state
    const { viewedGrid } = this.props.store
    const { batteryDebugData, batteryMinEnergyContent, batteryMaxEnergyContent } = viewedGrid
    const yMin = _.floor(batteryMinEnergyContent - batteryMinEnergyContent * 0.2)
    return (
      <div>
        <Header as="h3">Battery Predictions vs. Actual</Header>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <PredictedVsActual
                data={batteryDebugData}
                actual="originalBec"
                predicted={radioSelection}
              />
            </Grid.Column>
            <Grid.Column width={6}>
              <Form style={{ marginTop: '40px' }}>
                <Form.Field>
                  <Header as="h4">Select battery model version</Header>
                </Form.Field>
                {_.map(chartLines, chartName => {
                  return (
                    <Form.Field key={chartName} style={{ marginBottom: '4px' }}>
                      <Checkbox
                        radio
                        label={chartName}
                        name="checkboxRadioGroup"
                        value={chartName}
                        checked={radioSelection === chartName}
                        onChange={this.handleRadioChange}
                      />
                    </Form.Field>
                  )
                })}
              </Form>
              <Form style={{ marginTop: '40px' }}>
                <Form.Field>
                  <Header as="h4">Select battery model versions</Header>
                </Form.Field>
                {_.map(chartLines, chartName => {
                  return (
                    <Form.Field key={chartName} style={{ marginBottom: '4px' }}>
                      <Checkbox
                        label={chartName}
                        name="checkboxGroup"
                        value={chartName}
                        checked={checkedItems.has(chartName)}
                        onChange={this.handleCheckedChange}
                      />
                    </Form.Field>
                  )
                })}
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <ResponsiveContainer height={800}>
          <LineChart
            key={Math.random()} // Force rerendering every time the data changes
            data={batteryDebugData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="hour"
              label={{
                value: 'Hour',
                offset: -10,
                position: 'insideBottom',
              }}
            />
            <YAxis
              label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              domain={[yMin, 'auto']}
            />
            <Tooltip
              content={
                <CustomToolTip
                  batteryMin={batteryMinEnergyContent}
                  batteryMax={batteryMaxEnergyContent}
                />
              }
            />

            {_.map(chartLines, (chartName, index) => {
              if (checkedItems.has(chartName)) {
                return (
                  <Line
                    key={chartName}
                    type="linear"
                    // type="monotone"
                    dataKey={chartName}
                    dot={false}
                    stroke={chartColorsByIndex[index]}
                    isAnimationActive={false}
                  />
                )
              }
            })}

            <ReferenceLine
              y={batteryMaxEnergyContent}
              label={{
                position: 'top',
                value: `Max: ${_.round(batteryMaxEnergyContent, 2)}`,
                fontWeight: 500,
                textStroke: '2px white',
              }}
              stroke="#b9b9b9"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={batteryMinEnergyContent}
              label={{
                position: 'top',
                value: `Min: ${_.round(batteryMinEnergyContent, 2)}`,
                fontWeight: 500,
                textStroke: '2px white',
              }}
              stroke="#b9b9b9"
              strokeDasharray="3 3"
            />
            <Brush startIndex={0} endIndex={100} gap={5} />
          </LineChart>
        </ResponsiveContainer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Header as="h4">Charging (Positive)</Header>
              <BatteryLossCoeffChart direction="pos" />
            </Grid.Column>
            <Grid.Column width={8}>
              <Header as="h4">Discharging (Negative)</Header>
              <BatteryLossCoeffChart direction="neg" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
export default inject('store')(observer(BatteryDebugChart))

// -----------------------------------------------------------------------------
// Custom Tooltip
// -----------------------------------------------------------------------------

const CustomToolTip = ({ active, payload, label, batteryMin, batteryMax }) => {
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
                <Table.Cell>{element.dataKey}</Table.Cell>
                <Table.Cell textAlign="right">
                  {element.value} kWh ({asPercent(element.value, batteryMin, batteryMax)} %)
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
