import * as React from 'react'
import * as ReactDOM from 'react-dom'
import InputField from './index'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<InputField />, div)
  ReactDOM.unmountComponentAtNode(div)
})
