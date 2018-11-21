import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { NavItem } from './index'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Router>
      <NavItem to="/" children={[null, 'Home']} className="item" onClick={() => {}} />
    </Router>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
