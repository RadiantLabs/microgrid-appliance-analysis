import React from 'react'
import { ReactComponent as PowerConverterSVG } from '../../../images/ac_to_dc_power_converter.svg'
import { ReactComponent as InverterSVG } from '../../../images/dc_to_ac_inverter.svg'
import { ReactComponent as PlaceholderSVG } from '../../../images/placeholder.svg'

export const AncillaryEquipmentDiagram = ({ equipmentType }) => {
  switch (equipmentType) {
    case 'powerConverter':
      return <PowerConverterSVG />
    case 'inverter':
      return <InverterSVG />
    default:
      return <PlaceholderSVG />
  }
}
