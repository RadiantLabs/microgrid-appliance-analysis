import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import { Client } from './Client'
import MobxStore from './MobxStore'
import { Menu } from 'semantic-ui-react'
import { NavItem } from './components/Elements/NavItem'
import Home from './components/Home'
import About from './components/About'
import BatteryCharacterization from './components/BatteryCharacterization'
// import DevTools from 'mobx-react-devtools'
// import TodoExample from './components/Todo'
import './App.css'

// This is to be able to inspect the store from the inspector at any time.
let mobxStore = new MobxStore()
window.mobxStore = mobxStore

const App = () => (
  <Provider store={mobxStore}>
    <Router>
      <ApolloProvider client={Client}>
        <Menu secondary={true} pointing={true}>
          <Menu.Item as={NavItem} to="/" name="home" />
          <Menu.Item as={NavItem} to="/about" name="about" />
          <Menu.Item as={NavItem} to="/battery" name="battery" />
          {/* <Menu.Item as={NavItem} to="/todo" name="todo" /> */}
        </Menu>
        <div className="mainContent">
          <Route exact={true} path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/battery" component={BatteryCharacterization} />
          {/* <Route path="/todo" component={TodoExample} /> */}
        </div>
        {/* <DevTools /> */}
      </ApolloProvider>
    </Router>
  </Provider>
)

export default App
