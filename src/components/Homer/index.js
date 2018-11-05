import * as React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

class Homer extends React.Component {
  render() {
    const { store } = this.props
    console.log('store: ', store)
    const { fetchState, homer } = store
    console.log('homer: ', toJS(homer))
    return (
      <div className="ui centered grid">
        <div className="column">
          <h2>Homer Table</h2>
          <h3>{fetchState}</h3>
        </div>
      </div>
    )
  }
}

export default inject('store')(observer(Homer))
