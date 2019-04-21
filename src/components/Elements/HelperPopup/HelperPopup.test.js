import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { HelperPopup } from './index'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<HelperPopup />, div)
  ReactDOM.unmountComponentAtNode(div)
})
