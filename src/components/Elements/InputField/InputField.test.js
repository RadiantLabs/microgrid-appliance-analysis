import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import InputField from './index'
import MobxStore from '../../../MobxStore'

it('renders without crashing', () => {
  let mobxStore = new MobxStore()
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={mobxStore}>
      <div>
        <InputField fieldKey="kwFactorToKw" />
        <InputField fieldKey="dutyCycleDerateFactor" />
        <InputField fieldKey="wholesaleElectricityCost" />
        <InputField fieldKey="unmetLoadCostPerKwh" />
        <InputField fieldKey="retailElectricityPrice" />
        <InputField fieldKey="productionUnitsPerKwh" />
        <InputField fieldKey="revenuePerProductionUnits" />
        <InputField fieldKey="revenuePerProductionUnitsUnits" />
      </div>
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
