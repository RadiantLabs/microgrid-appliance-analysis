import * as React from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import CurveFittingChart from '../Charts/CurveFittingChart'
import LoaderSpinner from '../Elements/Loader'
import { greyColors } from '../../utils/constants'

class BatteryCharacterization extends React.Component {
  render() {
    const { calculatedColumns, activeHomer } = this.props.store
    if (_.isEmpty(calculatedColumns)) {
      return <LoaderSpinner />
    }
    return (
      <div>
        <h3>
          Battery Charge Rate <small style={{ color: greyColors[1] }}>TODO</small>
        </h3>
        <CurveFittingChart
          // isTraining={true}
          batteryData={_.drop(activeHomer, 2)}
          xAccessor="Battery Energy Content"
          yAccessor="Battery Maximum Charge Power"
          predictionLegend="Prediction Before Training"
        />
        <CurveFittingChart
          // isTraining={true}
          batteryData={_.drop(activeHomer, 2)}
          xAccessor="Battery Energy Content"
          yAccessor="Battery Discharge Power"
          predictionLegend="Prediction Before Training"
        />
      </div>
    )
  }
}

export default inject('store')(observer(BatteryCharacterization))
