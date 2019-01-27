import * as React from 'react'
import { Route } from 'react-router-dom'
import { Menu, Header } from 'semantic-ui-react'
import { NavItem } from 'components/Elements/NavItem'
import FileChooser from 'components/Main/FileChooser'

// Route Pages
import Summary from './Summary'
import AncillaryEquipment from './AncillaryEquipment'
import BatteryModel from './BatteryModel'
import DataTable from './DataTable'
import Loads from './Loads'
import UnmetLoads from './UnmetLoads'
import BatteryCharge from './BatteryCharge'

const Main = () => (
  <div>
    <FileChooser />

    <Menu secondary pointing>
      <Menu.Item as={NavItem} to="/" name="Summary" />
      <Menu.Item as={NavItem} to="/ancillary-equipment" name="Ancillary Equipment" />
      <Menu.Item as={NavItem} to="/datatable" name="Data" />
      <Menu.Item as={NavItem} to="/loads" name="Loads" />
      <Menu.Item as={NavItem} to="/unmet-loads" name="Unmet Loads" />
      <Menu.Item as={NavItem} to="/battery-charge" name="Battery Charge" />
      <Menu.Item as={NavItem} to="/battery-model" name="Battery Model" />
    </Menu>

    <div className="mainContent">
      <Route exact={true} path="/" component={Summary} />
      <Route path="/ancillary-equipment" component={AncillaryEquipment} />
      <Route path="/datatable" component={DataTable} />
      <Route path="/loads" component={Loads} />
      <Route path="/unmet-loads" component={UnmetLoads} />
      <Route path="/battery-charge" component={BatteryCharge} />
      <Route path="/battery-model" component={BatteryModel} />
      {/* <Route path="/todo" component={TodoExample} /> */}
    </div>
  </div>
)

export default Main
