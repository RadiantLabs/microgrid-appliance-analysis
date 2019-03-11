import * as React from 'react'
import { Route } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import { NavItem } from 'src/components/Elements/NavItem'
import HomerFiles from 'src/components/UploadFiles/HomerFiles'
import ApplianceFiles from 'src/components/UploadFiles/ApplianceFiles'

const UploadFiles = () => {
  return (
    <div>
      <Menu secondary pointing>
        <Menu.Item as={NavItem} to={`/files/homer`} name="HOMER Grid Files" />
        <Menu.Item as={NavItem} to={`/files/appliance`} name="Appliance Files" />
      </Menu>
      <div>
        <Route exact path="/files/" component={HomerFiles} />
        <Route exact path="/files/homer" component={HomerFiles} />
        <Route exact path="/files/appliance" component={ApplianceFiles} />
      </div>
    </div>
  )
}

export default UploadFiles
