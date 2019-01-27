import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import BatteryCharacterization from './index'
import MobxStore from '../../MobxStore'

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <BatteryCharacterization />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
