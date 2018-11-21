import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { HelperPopup } from './index'
import { UnmetLoadHelperPopup } from './UnmetLoadHelperPopup'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<HelperPopup />, div)
  ReactDOM.unmountComponentAtNode(div)
})

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<UnmetLoadHelperPopup />, div)
  ReactDOM.unmountComponentAtNode(div)
})
