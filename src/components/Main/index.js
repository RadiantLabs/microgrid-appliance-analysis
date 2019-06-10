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
import BatteryEnergyContent from './BatteryEnergyContent'
import GridAnalysis from './TimeSegments'
import SystemComponents from './GridComponents'

const Main = ({ match, store }) => {
  const { activeGrid } = store
  if (_.isEmpty(activeGrid)) {
    return <EmptyState />
  }
  return (
    <div>
      <FileChooser />

      <Menu secondary pointing>
        <Menu.Item as={NavItem} to={`/`} name="Results" />
        <Menu.Item as={NavItem} to={`/tool/components`} name="System Components" />
        <Menu.Item as={NavItem} to={`/tool/ancillary`} name="Ancillary Equipment" />
        <Menu.Item as={NavItem} to={`/tool/grid-analysis`} name="Grid Analysis" />
        <Menu.Item as={NavItem} to={`/tool/battery-energy-content`} name="Battery Analysis" />
        <Menu.Item as={NavItem} to={`/tool/loads`} name="Load Analysis" />
        <Menu.Item as={NavItem} to={`/tool/datatable`} name="Raw Data" />
      </Menu>

      <div className="mainContent">
        <Route exact path="/" component={Summary} />
        <Route exact path="/tool" component={Summary} />
        <Route path={`/tool/summary`} component={Summary} />
        <Route path={`/tool/components`} component={SystemComponents} />
        <Route path={`/tool/ancillary`} component={AncillaryEquipment} />
        <Route path={`/tool/grid-analysis`} component={GridAnalysis} />
        <Route path={`/tool/battery-energy-content`} component={BatteryEnergyContent} />
        <Route path={`/tool/loads`} component={Loads} />
        <Route path={`/tool/datatable`} component={DataTable} />
      </div>
    </div>
  )
}

export default inject('store')(observer(Main))
