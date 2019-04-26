import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { UnmetLoadHelperModal } from './index'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<UnmetLoadHelperModal />, div)
  ReactDOM.unmountComponentAtNode(div)
})
