import * as Sentry from '@sentry/browser'

// Throw an error if developing locally. Otherwise let Sentry capture it
export function logger(error, level) {
  // if (process.env.NODE_ENV !== 'production') {
  //   throw new Error(error)
  // }
  Sentry.withScope(scope => {
    console.log('Logging new error: ', error, scope)
    // if (tag) {
    //   scope.setTag('my-tag', 'my value')
    // }
    if (level) {
      scope.setLevel(level)
    }
    Sentry.captureException(new Error(error))
  })
}
