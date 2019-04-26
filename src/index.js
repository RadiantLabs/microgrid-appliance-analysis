import 'react-app-polyfill/ie11'
import 'isomorphic-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import App from './App'
import 'semantic-ui-css/semantic.min.css'
import './styles/index.css'
import 'react-virtualized/styles.css'

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
