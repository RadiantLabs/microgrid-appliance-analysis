import * as Sentry from '@sentry/browser'

export function logger(error) {
  console.error('logging error: ', error)
  Sentry.captureException(new Error(error))
}
