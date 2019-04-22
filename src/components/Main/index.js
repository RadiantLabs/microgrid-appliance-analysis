import * as React from 'react'
import { Route } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { Menu } from 'semantic-ui-react'
import { NavItem } from '../../components/Elements/NavItem'
import FileChooser from '../../components/Main/FileChooser'
import EmptyState from '../../components/Main/EmptyState'

// Route Pages
import Summary from './Summary'
import AncillaryEquipment from './AncillaryEquipment'
import DataTable from './DataTable'
import Loads from './Loads'
import UnmetLoads from './UnmetLoads'
import BatteryEnergyContent from './BatteryEnergyContent'
import TimeSegments from './TimeSegments'
import GridComponents from './GridComponents'

const Main = ({ match, store }) => {
  const { activeGrid } = store
  if (_.isEmpty(activeGrid)) {
    return <EmptyState />
  }
  return (
    <div>
      <FileChooser />

      <Menu secondary pointing>
        <Menu.Item as={NavItem} to={`/`} name="Summary" />
        <Menu.Item as={NavItem} to={`/tool/ancillary`} name="Ancillary Equipment" />
        <Menu.Item as={NavItem} to={`/tool/datatable`} name="Data" />
        <Menu.Item as={NavItem} to={`/tool/loads`} name="Loads" />
        <Menu.Item as={NavItem} to={`/tool/unmet-loads`} name="Unmet Loads" />
        <Menu.Item as={NavItem} to={`/tool/battery-energy-content`} name="Battery Energy Content" />
        <Menu.Item as={NavItem} to={`/tool/time-segments`} name="Time Segments" />
        <Menu.Item as={NavItem} to={`/tool/components`} name="Grid Components" />
      </Menu>

      <div className="mainContent">
        <Route exact path="/" component={Summary} />
        <Route exact path="/tool" component={Summary} />
        <Route path={`/tool/summary`} component={Summary} />
        <Route path={`/tool/ancillary`} component={AncillaryEquipment} />
        <Route path={`/tool/datatable`} component={DataTable} />
        <Route path={`/tool/loads`} component={Loads} />
        <Route path={`/tool/unmet-loads`} component={UnmetLoads} />
        <Route path={`/tool/battery-energy-content`} component={BatteryEnergyContent} />
        <Route path={`/tool/time-segments`} component={TimeSegments} />
        <Route path={`/tool/components`} component={GridComponents} />
      </div>
    </div>
  )
}

export default inject('store')(observer(Main))
