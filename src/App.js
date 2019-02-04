import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import _ from 'lodash'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import { Client } from './Client'
import MobxStore from './MobxStore'
import { Menu, Icon } from 'semantic-ui-react'
import { NavItem } from 'components/Elements/NavItem'
import { homerFiles, applianceFiles, ancillaryEquipment } from 'utils/fileInfo'

// Route Pages
import Main from 'components/Main'
import About from 'components/About'
import Profile from 'components/Profile'
import FourOhFour from 'components/FourOhFour'

// import DevTools from 'mobx-react-devtools'
// import TodoExample from 'componentsTodo'
import './App.css'

/**
 * Initialize Mobx State Tree Store
 */
// let mobxStore = new MobxStore() // Vanilla Mobx
const initHomerFileName = '12-50 Oversize 20'
const initApplianceFileName = 'rice_mill_usage_profile'

const initialState = {
  initHomerFileName,
  homerIsLoading: true,
  activeHomerFileInfo: _.find(homerFiles, { fileName: initHomerFileName }),
  activeHomer: [],

  initApplianceFileName,
  applianceIsLoading: false,
  activeApplianceFileInfo: _.find(applianceFiles, { fileName: initApplianceFileName }),
  activeAppliance: [],
}

let mobxStore = MobxStore.create(initialState)
// This is to be able to inspect the store from the inspector at any time.
window.mobxStore = mobxStore

const App = () => (
  <Provider store={mobxStore}>
    <Router>
      <ApolloProvider client={Client}>
        <Menu>
          <Menu.Item header as={NavItem} to="/">
            Microgrid Appliance Analysis Tool
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item name="wrench">
              <Icon name="wrench" />
            </Menu.Item>
            <Menu.Item as={NavItem} to="/about" name="About" />
            <Menu.Item as={NavItem} to="/profile" name="Logout" />
          </Menu.Menu>
        </Menu>

        <div className="main-wrapper">
          <Switch>
            <Route path="/" exact component={Main} />
            <Route path="/tool" component={Main} />
            <Route path="/about" component={About} />
            <Route path="/profile" component={Profile} />
            <Route component={FourOhFour} />
          </Switch>
        </div>

        {/* <DevTools /> */}
      </ApolloProvider>
    </Router>
  </Provider>
)

export default App
