import * as React from 'react'
// import { Router, Route, Switch } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { Container } from 'semantic-ui-react'
// import { NavItem } from './components/Elements/NavItem'

const Debug = ({ store }) => {
  // const { saveAppState, appIsSavedTimestamp } = store
  return (
    <Container>
      <h3>Debug</h3>
    </Container>
  )
}

export default inject('store')(observer(Debug))
