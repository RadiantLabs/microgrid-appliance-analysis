import React, { Component } from 'react'
import _ from 'lodash'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts'
import { observer, inject } from 'mobx-react'
import { Table, Form, Checkbox } from 'semantic-ui-react'
import { chartColorsByIndex } from '../../utils/constants'

const chartLines = ['homerOriginal', 'naive', 'naiveClamped', 'mlr']

class BatteryDebugChart extends Component {
  state = {
    checkedItems: new Set(chartLines),
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

  render() {
    const { checkedItems } = this.state
    const { viewedGrid, batteryDebugData } = this.props.store
    const {
      batteryMinEnergyContent,
      batteryMaxEnergyContent,
      // batteryMinSoC,
      // batteryMaxSoC,
    } = viewedGrid
    const yMin = _.floor(batteryMinEnergyContent - batteryMinEnergyContent * 0.2)
    return (
      <div>
        <Form>
          <Form.Group inline>
            <Form.Field>
              <Checkbox
                label="homerOriginal"
                name="checkboxRadioGroup"
                value="homerOriginal"
                checked={checkedItems.has('homerOriginal')}
                onChange={this.handleCheckedChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label="naive"
                name="checkboxRadioGroup"
                value="naive"
                checked={checkedItems.has('naive')}
                onChange={this.handleCheckedChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label="naiveClamped"
                name="checkboxRadioGroup"
                value="naiveClamped"
                checked={checkedItems.has('naiveClamped')}
                onChange={this.handleCheckedChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label="mlr"
                name="checkboxRadioGroup"
                value="mlr"
                checked={checkedItems.has('mlr')}
                onChange={this.handleCheckedChange}
              />
            </Form.Field>
          </Form.Group>
        </Form>

        <ResponsiveContainer height={600}>
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
            <Tooltip content={<CustomToolTip />} />
            <Legend verticalAlign="top" align="right" iconType="line" />

            {_.map(chartLines, (chartName, index) => {
              if (checkedItems.has(chartName)) {
                return (
                  <Line
                    key={chartName}
                    type="monotone"
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
            <Brush startIndex={0} endIndex={200} gap={5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}
export default inject('store')(observer(BatteryDebugChart))

// -----------------------------------------------------------------------------
// Custom Tooltip
// -----------------------------------------------------------------------------

const CustomToolTip = ({ active, payload, label }) => {
  if (!active || _.isEmpty(payload)) {
    return null
  }
  const fields = payload[0]['payload']
  return (
    <div className="custom-tooltip">
      <p className="label">Hour of Day: {label}</p>
      <Table basic="very" compact>
        <Table.Body>
          {_.map(payload, element => {
            return (
              <Table.Row style={{ color: element.color }} key={element.dataKey}>
                <Table.Cell>{element.dataKey}</Table.Cell>
                <Table.Cell textAlign="right">{element.value} kWh</Table.Cell>
              </Table.Row>
            )
          })}
          <Table.Row>
            <Table.Cell>naiveOriginalDiff</Table.Cell>
            <Table.Cell textAlign="right">{fields['naiveOriginalDiff']} kWh</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>naiveOriginalPct</Table.Cell>
            <Table.Cell textAlign="right">{fields['naiveOriginalPct']} %</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}
