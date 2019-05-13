import React, { Component } from 'react'
import _ from 'lodash'
import {
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
  // ReferenceLine,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts'
import { observer, inject } from 'mobx-react'
// import { Table } from 'semantic-ui-react'

class BatteryLossCoeffChart extends Component {
  render() {
    const { direction } = this.props
    const { viewedGrid } = this.props.store
    const { lossCoeffData, lossCoeffPosData, lossCoeffNegData } = viewedGrid.batteryLossCoeff
    // let data = direction === 'pos' ? lossCoeffPosData : lossCoeffNegData
    let data = lossCoeffData
    data = _.slice(data, 0, 14)
    console.table('_______', direction, '___________')
    console.table(data)

    return (
      <ResponsiveContainer height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
          <XAxis
            type="number"
            // dataKey="bateryEnergyContent"
            dataKey="chargeDiff"
            label={{
              // value: 'Battery Energy Content',
              value: 'chargeDiff',
              offset: -10,
              position: 'insideBottom',
            }}
          />
          <YAxis
            type="number"
            dataKey="coeff"
            label={{ value: 'Battery Loss Coefficient', angle: -90 }}
          />
          <CartesianGrid />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Trained data" data={data} line fill="#83A1C3" shape={<Dot r={3} />} />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
}
export default inject('store')(observer(BatteryLossCoeffChart))

// -----------------------------------------------------------------------------
// Custom Tooltip
// -----------------------------------------------------------------------------
// const CustomToolTip = ({ active, payload, label }) => {
//   if (!active || _.isEmpty(payload)) {
//     return null
//   }
//   const fields = payload[0]['payload']
//   return (
//     <div className="custom-tooltip">
//       <p className="label">Hour of Day: {label}</p>
//       <Table basic="very" compact>
//         <Table.Body>
//           {_.map(payload, element => {
//             return (
//               <Table.Row style={{ color: element.color }} key={element.dataKey}>
//                 <Table.Cell>{element.dataKey}</Table.Cell>
//                 <Table.Cell textAlign="right">{element.value} kWh</Table.Cell>
//               </Table.Row>
//             )
//           })}
//           {/* <Table.Row>
//             <Table.Cell>naiveClampedOriginalDiff</Table.Cell>
//             <Table.Cell textAlign="right">{fields['naiveClampedOriginalDiff']} kWh</Table.Cell>
//           </Table.Row>
//           <Table.Row>
//             <Table.Cell>naiveClampedOriginalPct</Table.Cell>
//             <Table.Cell textAlign="right">{fields['naiveClampedOriginalPct']} %</Table.Cell>
//           </Table.Row> */}
//         </Table.Body>
//       </Table>
//     </div>
//   )
// }
