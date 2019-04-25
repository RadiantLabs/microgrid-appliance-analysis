import _ from 'lodash'
import * as Sentry from '@sentry/browser'

export function loggerConfig(command, data) {
  // if (process.env.NODE_ENV !== 'production') {
  //   return null
  // }
  switch (command) {
    case 'init':
      return init()
    case 'user':
      return user(data)
    default:
      throw new Error(`loggerConfig was passed an unknown command: ${command}`)
  }
}

function init() {
  console.log('Initializing Sentry Error logging for ALL environments')
  Sentry.init({
    dsn: 'https://89977b0faa6a4d1aa58dd8dd1eb469ca@sentry.io/1325177',
  })
}

// Identify user to both Sentry error logging and Heap analytics
function user(data) {
  const { userName, userEmail } = data
  console.log('setting Sentry user: ', data)
  Sentry.configureScope(scope => {
    scope.setUser({ username: userName, email: userEmail })
  })
  if (_.isFunction(window.heap.identify)) {
    window.heap.identify(heapUserName(data))
  } else {
    Sentry.captureException(new Error(`heap.identify is not a function`))
  }
}

function heapUserName(data) {
  const { userName, userEmail } = data
  return `${_.kebabCase(userName)}|${userEmail}`
}
