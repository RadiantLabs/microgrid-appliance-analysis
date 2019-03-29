import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import LoaderSpinner from '../../../components/Elements/Loader'
// import BatteryChargeTable from '../../../components/Elements/BatteryChargeTable'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  Legend,
  ResponsiveContainer,
  // AreaChart,
  // CartesianGrid,
  // Area,
} from 'recharts'
import { getChartColors, greyColors } from '../../../utils/constants'

// const data = [
//   { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
//   { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
//   { name: 'Page C', uv: -1000, pv: 9800, amt: 2290 },
//   { name: 'Page D', uv: 500, pv: 3908, amt: 2000 },
//   { name: 'Page E', uv: -2000, pv: 4800, amt: 2181 },
//   { name: 'Page F', uv: -250, pv: 3800, amt: 2500 },
//   { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
// ]
//
// const gradientOffset = () => {
//   const dataMax = Math.max(...data.map(i => i.uv))
//   const dataMin = Math.min(...data.map(i => i.uv))
//
//   if (dataMax <= 0) {
//     return 0
//   } else if (dataMin >= 0) {
//     return 1
//   } else {
//     return dataMax / (dataMax - dataMin)
//   }
// }
// const off = gradientOffset()

class BatteryEnergyContent extends React.Component {
  render() {
    const { hybridColumns } = this.props.store
    if (_.isEmpty(hybridColumns)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h3>
          Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
        </h3>
        {/*<ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <AreaChart
            width={600}
            height={400}
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor="green" stopOpacity={1} />
                <stop offset={off} stopColor="red" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="uv"
              stroke="#000"
              strokeWidth={1}
              fill="url(#splitColor)"
            />
          </AreaChart>
        </ResponsiveContainer>*/}

        <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
          <LineChart
            width={1400}
            height={400}
            data={hybridColumns}
            syncId="anyId"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="energyContentAboveMin"
              dot={false}
              stroke={getChartColors('energyContentAboveMin')}
            />
            <Line
              type="monotone"
              dataKey="newApplianceBatteryEnergyContent"
              dot={false}
              stroke={getChartColors('newApplianceBatteryEnergyContent')}
            />
            <Legend />
            <Brush startIndex={0} endIndex={200} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default inject('store')(observer(BatteryEnergyContent))

// <CartesianGrid strokeDasharray="3 3" />

// Original:
// class BatteryEnergyContent extends React.Component {
//   render() {
//     const { activeGrid, hybridColumns } = this.props.store
//     if (_.isEmpty(hybridColumns)) {
//       return <LoaderSpinner />
//     }
//     return (
//       <div>
//         <h3>
//           Battery Energy Content by hour of year <small style={{ color: greyColors[1] }}>kWh</small>
//         </h3>
//         <BatteryChargeTable grid={activeGrid} />
//         <ResponsiveContainer minWidth={1000} minHeight={400} height="90%">
//           <LineChart
//             width={1400}
//             height={400}
//             data={hybridColumns}
//             syncId="anyId"
//             margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//             <XAxis dataKey="hour" />
//             <YAxis />
//             <Tooltip />
//             <Line
//               type="monotone"
//               dataKey="energyContentAboveMin"
//               dot={false}
//               stroke={getChartColors('energyContentAboveMin')}
//             />
//             <Line
//               type="monotone"
//               dataKey="newApplianceBatteryEnergyContent"
//               dot={false}
//               stroke={getChartColors('newApplianceBatteryEnergyContent')}
//             />
//             <Legend />
//             <Brush startIndex={0} endIndex={200} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     )
//   }
// }
