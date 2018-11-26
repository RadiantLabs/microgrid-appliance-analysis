import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import ApplianceTable from './ApplianceTable'
import AvailableLoadChart from './AvailableLoadChart'
import BatteryEnergyContentChart from './BatteryEnergyContentChart'
import CombinedTable from './CombinedTable'
import HomerTable from './HomerTable'
import UnmetLoadsChart from './UnmetLoadsChart'
import MobxStore from '../../MobxStore'

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <ApplianceTable />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <AvailableLoadChart />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <BatteryEnergyContentChart />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <CombinedTable />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <HomerTable />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <UnmetLoadsChart />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
