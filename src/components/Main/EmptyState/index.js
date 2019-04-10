import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Grid, Loader } from 'semantic-ui-react'

const EmptyState = ({ store }) => {
  return (
    <div className="main-wrapper" style={{ padding: '20px' }}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <h3>
              Data is Loading <Loader active inline size="tiny" />
            </h3>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row />
      </Grid>
    </div>
  )
}

export default inject('store')(observer(EmptyState))
