import * as React from 'react'
import { BrowserRouter as Router, Link, Route, NavLink } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import InputExample from './components/InputExample'
import About from './components/About'
import './App.css'

// Integrating Semantic UI menu items with React Router
// https://github.com/Semantic-Org/Semantic-UI-React/issues/142#issuecomment-364225477
const NavItem = (props: any) => (
  <NavLink exact={true} {...props} activeClassName="active" />
)

const App = () => (
  <Router>
    <div>
      <Menu secondary={true}>
        <Menu.Item as={NavItem} to="/" name="home" />
        <Menu.Item as={NavItem} to="/input-example" name="input-example" />
        <Menu.Item as={NavItem} to="/about" name="about" />
      </Menu>
      <div className="mainContent">
        <Route exact={true} path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/input-example" component={InputExample} />
      </div>
    </div>
  </Router>
)

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

export default App
