import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { Client } from './Client'
import { mobxStore } from './MobxStore'
import { Menu } from 'semantic-ui-react'
import InputExample from './components/InputExample'
import { NavItem } from './components/NavItem'
import About from './components/About'
// import TodoExample from './components/Todo'
import Home from './components/Home'
import './App.css'

const App = () => (
  <Provider store={mobxStore}>
    <Router>
      <ApolloProvider client={Client}>
        <Menu secondary={true}>
          <Menu.Item as={NavItem} to="/" name="home" />
          <Menu.Item as={NavItem} to="/input-example" name="input-example" />
          <Menu.Item as={NavItem} to="/about" name="about" />
          {/* <Menu.Item as={NavItem} to="/todo" name="todo" /> */}
        </Menu>
        <div className="mainContent">
          <Route exact={true} path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/input-example" component={InputExample} />
          {/* <Route path="/todo" component={TodoExample} /> */}
        </div>
        <DevTools />
      </ApolloProvider>
    </Router>
  </Provider>
)

export default App
