import * as React from 'react'
import { Route } from 'react-router-dom'
import { Grid, Menu } from 'semantic-ui-react'
import { NavItem } from 'components/Elements/NavItem'
import HomerFiles from 'components/UploadFiles/HomerFiles'
import ApplianceUsageFiles from 'components/UploadFiles/ApplianceUsageFiles'

const UploadFiles = () => {
  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column width={3}>
          <Menu pointing secondary vertical fluid>
            <Menu.Item as={NavItem} to={`/files/homer`} name="HOMER Grid Files" />
            <Menu.Item as={NavItem} to={`/files/appliance-usage`} name="Appliance Usage Files" />
          </Menu>
        </Grid.Column>
        <Grid.Column width={13}>
          <div className="mainContent">
            <Route exact path="/files/" component={HomerFiles} />
            <Route exact path="/files/homer" component={HomerFiles} />
            <Route exact path="/files/appliance-usage" component={ApplianceUsageFiles} />
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default UploadFiles
