import * as React from 'react'
import { Route } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import { NavItem } from '../../components/Elements/NavItem'
import FileChooser from '../../components/Main/FileChooser'

// Route Pages
import Summary from './Summary'
import AncillaryEquipment from './AncillaryEquipment'
import DataTable from './DataTable'
import Loads from './Loads'
import UnmetLoads from './UnmetLoads'
import BatteryCharge from './BatteryCharge'

const Main = ({ match }) => {
  return (
    <div>
      <FileChooser />

      <Menu secondary pointing>
        <Menu.Item as={NavItem} to={`/`} name="Summary" />
        <Menu.Item as={NavItem} to={`/tool/ancillary`} name="Ancillary Equipment" />
        <Menu.Item as={NavItem} to={`/tool/datatable`} name="Data" />
        <Menu.Item as={NavItem} to={`/tool/loads`} name="Loads" />
        <Menu.Item as={NavItem} to={`/tool/unmet-loads`} name="Unmet Loads" />
        <Menu.Item as={NavItem} to={`/tool/battery-charge`} name="Battery Charge" />
      </Menu>

      <div className="mainContent">
        <Route exact path="/" component={Summary} />
        <Route exact path="/tool" component={Summary} />
        <Route path={`/tool/summary`} component={Summary} />
        <Route path={`/tool/ancillary`} component={AncillaryEquipment} />
        <Route path={`/tool/datatable`} component={DataTable} />
        <Route path={`/tool/loads`} component={Loads} />
        <Route path={`/tool/unmet-loads`} component={UnmetLoads} />
        <Route path={`/tool/battery-charge`} component={BatteryCharge} />
      </div>
    </div>
  )
}

export default Main
