import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import { Client } from './Client'
import MobxStore from './MobxStore'
import { Menu } from 'semantic-ui-react'
import { NavItem } from './components/Elements/NavItem'

// Route Pages
import Summary from './components/Summary'
import About from './components/About'
import AncillaryEquipment from './components/AncillaryEquipment'
import BatteryModel from './components/BatteryModel'
import Profile from './components/Profile'
import DataTable from './components/DataTable'
import Loads from './components/Loads'
import UnmetLoads from './components/UnmetLoads'
import BatteryCharge from './components/BatteryCharge'

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
        <Menu secondary pointing>
          <Menu.Item as={NavItem} to="/" name="Summary" />
          <Menu.Item as={NavItem} to="/ancillary-equipment" name="Ancillary Equipment" />
          <Menu.Item as={NavItem} to="/datatable" name="Data" />
          <Menu.Item as={NavItem} to="/loads" name="Loads" />
          <Menu.Item as={NavItem} to="/unmet-loads" name="Unmet Loads" />
          <Menu.Item as={NavItem} to="/battery-charge" name="Battery Charge" />
          <Menu.Item as={NavItem} to="/battery-model" name="Battery Model" />
          <Menu.Menu position="right">
            <Menu.Item as={NavItem} to="/about" name="About" />
            <Menu.Item as={NavItem} to="/profile" name="Logout" />
          </Menu.Menu>
        </Menu>

        <div className="mainContent">
          <Route exact={true} path="/" component={Summary} />
          <Route path="/about" component={About} />
          <Route path="/ancillary-equipment" component={AncillaryEquipment} />
          <Route path="/datatable" component={DataTable} />
          <Route path="/loads" component={Loads} />
          <Route path="/unmet-loads" component={UnmetLoads} />
          <Route path="/battery-charge" component={BatteryCharge} />
          <Route path="/battery-model" component={BatteryModel} />
          <Route path="/profile" component={Profile} />
          {/* <Route path="/todo" component={TodoExample} /> */}
        </div>
        {/* <DevTools /> */}
      </ApolloProvider>
    </Router>
  </Provider>
)

export default App
