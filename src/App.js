import * as React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import { Client } from './Client'
import { mainStore, history } from 'stores/MainStore'
import { Menu, Icon } from 'semantic-ui-react'
import { NavItem } from 'components/Elements/NavItem'
import shortLogo from 'images/factore-short-logo-20x26.png'

// Route Pages
import Main from 'components/Main'
import About from 'components/About'
// import Profile from 'components/Profile'
import FourOhFour from 'components/FourOhFour'

// import DevTools from 'mobx-react-devtools'
// import TodoExample from 'componentsTodo'
import './App.css'

const App = () => (
  <Provider store={mainStore}>
    <Router history={history}>
      <ApolloProvider client={Client}>
        <Menu>
          <Menu.Item header as={NavItem} to="/">
            <img
              src={shortLogo}
              style={{ width: '20px', marginRight: '5px' }}
              alt="Factor[e] Microgrid Appliance Tool"
            />
            Microgrid Appliance Analysis Tool
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item as={NavItem} to="/snapshots">
              <Icon name="photo" />
              Snapshots
            </Menu.Item>
            <Menu.Item as={NavItem} to="/files">
              <Icon name="file" />
              Files
            </Menu.Item>
            <Menu.Item as={NavItem} to="/about">
              <Icon name="info circle" />
              About Us
            </Menu.Item>
            {/*<Menu.Item as={NavItem} to="/about" name="About" />*/}
            {/*<Menu.Item as={NavItem} to="/profile" name="Logout" />*/}
          </Menu.Menu>
        </Menu>

        <div className="main-wrapper">
          <Switch>
            <Route path="/" exact component={Main} />
            <Route path="/tool" component={Main} />
            <Route path="/about" component={About} />
            {/*<Route path="/profile" component={Profile} />*/}
            <Route component={FourOhFour} />
          </Switch>
        </div>

        {/* <DevTools /> */}
      </ApolloProvider>
    </Router>
  </Provider>
)

export default App
