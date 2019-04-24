import * as React from 'react'
// import { Router, Route, Switch } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { Grid, Button } from 'semantic-ui-react'
import { lastSavedTimeAgo } from '../../utils/helpers'
// import { NavItem } from './components/Elements/NavItem'

const Debug = ({ store }) => {
  const { clearAppState, appIsSavedTimestamp } = store
  return (
    <div className="main-wrapper" style={{ padding: '20px' }}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <h3>Debug</h3>
            <p>Sorry for the problems....</p>
            <p>Last Saved Version Found: {lastSavedTimeAgo(appIsSavedTimestamp)}</p>
            <p>
              Delete locally saved app state:{' '}
              <Button
                content="Delete Local Data"
                icon="delete"
                color="red"
                compact
                onClick={clearAppState}
                basic
                style={{ marginLeft: '10px' }}
              />
            </p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row />
      </Grid>
    </div>
  )
}

export default inject('store')(observer(Debug))
