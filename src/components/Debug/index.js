import * as React from 'react'
// import { Router, Route, Switch } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { Container, Button } from 'semantic-ui-react'
import { lastSavedTimeAgo } from '../../utils/helpers'
// import { NavItem } from './components/Elements/NavItem'

const Debug = ({ store }) => {
  const { clearAppState, appIsSavedTimestamp } = store
  return (
    <Container>
      <h3>Debug</h3>
      Last Saved Version Found: {lastSavedTimeAgo(appIsSavedTimestamp)}
      <Button
        content="Delete Local Data"
        icon="delete"
        color="red"
        compact
        onClick={clearAppState}
        basic
      />
    </Container>
  )
}

export default inject('store')(observer(Debug))
