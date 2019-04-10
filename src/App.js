import * as React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import moment from 'moment'
import { Client } from './Client'
import { mainStore, history } from './stores/MainStore'
import { Menu, Icon, Button, Popup } from 'semantic-ui-react'
import { NavItem } from './components/Elements/NavItem'
import shortLogo from './images/factore-short-logo-20x26.png'

// Route Pages
import Main from './components/Main'
import About from './components/About'
import UploadFiles from './components/UploadFiles'
import Snapshots from './components/Snapshots'
// import Profile from './components/Profile'
import FourOhFour from './components/FourOhFour'

// import DevTools from 'mobx-react-devtools'
import './App.css'

const TopMenu = inject('store')(
  observer(({ store }) => {
    const { saveAppState, appIsSavedTimestamp } = store
    return (
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
          {/* <Menu.Item as={NavItem} to="/snapshots">
            <Icon name="photo" />
            Snapshots
          </Menu.Item> */}
          <div style={{ paddingTop: '8px', paddingRight: '8px' }}>
            <Popup
              position="bottom center"
              inverted
              // Keep content as a callback function so it will be updated every hover
              content={() => `Last Saved: ${moment(appIsSavedTimestamp).fromNow()}`}
              trigger={
                <Button
                  content="Save"
                  icon="save"
                  size="tiny"
                  color="blue"
                  compact
                  onClick={saveAppState}
                  basic
                />
              }
            />
          </div>
          <Menu.Item as={NavItem} to="/files/homer">
            <Icon name="file" />
            Files
          </Menu.Item>
          <Menu.Item as={NavItem} to="/about">
            <Icon name="info circle" />
            About
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  })
)

const App = () => (
  <Provider store={mainStore}>
    <Router history={history}>
      <ApolloProvider client={Client}>
        <TopMenu />
        <div className="main-wrapper">
          <Switch>
            <Route path="/" exact component={Main} />
            <Route path="/tool" component={Main} />
            <Route path="/snapshots" component={Snapshots} />
            <Route path="/files" component={UploadFiles} />
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
