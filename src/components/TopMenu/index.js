import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Menu, Icon, Button, Popup } from 'semantic-ui-react'
import { lastSavedTimeAgo } from '../../utils/helpers'
import { NavItem } from '../../components/Elements/NavItem'
import shortLogo from '../../images/factore-short-logo-20x26.png'

export const TopMenu = inject('store')(
  observer(({ store }) => {
    const { saveAppState, appIsSavedTimestamp } = store
    return (
      <Menu>
        <Menu.Item header as={NavItem} to="/">
          <img
            src={shortLogo}
            style={{ width: '20px', marginRight: '5px' }}
            alt="Factor[e] Microgrid Appliance Tool"
          />
          Microgrid Appliance Analysis Tool
        </Menu.Item>
        <Menu.Menu position="right">
          {/* <Menu.Item as={NavItem} to="/snapshots">
            <Icon name="photo" />
            Snapshots
          </Menu.Item> */}
          <div style={{ paddingTop: '8px', paddingRight: '8px' }}>
            <Popup
              position="bottom center"
              inverted
              // Keep content as a callback function so it will be updated every hover
              content={() => lastSavedTimeAgo(appIsSavedTimestamp)}
              trigger={
                <Button
                  content="Save"
                  icon="save"
                  size="tiny"
                  color="blue"
                  compact
                  onClick={saveAppState}
                  basic
                />
              }
            />
          </div>
          <Menu.Item as={NavItem} to="/files/homer">
            <Icon name="file" />
            Files
          </Menu.Item>
          <Menu.Item as={NavItem} to="/about">
            <Icon name="info circle" />
            About
          </Menu.Item>
          {/* <Menu.Item as={NavItem} to="/profile">
            <Icon name="user" />
            User
          </Menu.Item> */}
        </Menu.Menu>
      </Menu>
    )
  })
)
