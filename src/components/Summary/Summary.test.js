import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import Summary from './index'
import ApplianceOperatorSummary from './ApplianceOperatorSummary'
import FileChoosers from './FileChoosers'
import GridOperatorSummary from './GridOperatorSummary'
import ModelInputs from './ModelInputs'
import ResultsSection from './ResultsSection'
import MobxStore from '../../MobxStore'

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <Summary />
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
      <ApplianceOperatorSummary />
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
      <FileChoosers />
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
      <GridOperatorSummary />
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
      <ModelInputs />
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
      <ResultsSection />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
