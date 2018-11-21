import * as React from 'react'
import * as ReactDOM from 'react-dom'
import LoaderSpinner from './index'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<LoaderSpinner />, div)
  ReactDOM.unmountComponentAtNode(div)
})
