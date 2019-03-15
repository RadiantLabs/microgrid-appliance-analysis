import React from 'react'
import ReactDOM from 'react-dom'
// import * as Sentry from '@sentry/browser'
import * as serviceWorker from './serviceWorker'
import App from './App'
import 'semantic-ui-css/semantic.min.css'
// import 'src/styles/semantic.css'
import './styles/index.css'
import 'react-virtualized/styles.css'

// if (process.env.NODE_ENV === 'production') {
//   console.log('Initializing Sentry Error logging for production environment')
//   Sentry.init({
//     dsn: 'https://89977b0faa6a4d1aa58dd8dd1eb469ca@sentry.io/1325177',
//   })
// }

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
