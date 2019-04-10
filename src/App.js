import * as React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'mobx-react'
import { Client } from './Client'
import { mainStore, history } from './stores/MainStore'
import { TopMenu } from './components/TopMenu'

// Route Pages
import Main from './components/Main'
import About from './components/About'
import UploadFiles from './components/UploadFiles'
import Snapshots from './components/Snapshots'
// import Profile from './components/Profile'
import FourOhFour from './components/FourOhFour'
import Debug from './components/Debug'

// import DevTools from 'mobx-react-devtools'
import './App.css'

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
            <Route path="/debug" component={Debug} />
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
