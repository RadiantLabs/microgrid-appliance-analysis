import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Input } from 'semantic-ui-react'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import borderlessTableStyles from 'src/styles/borderlessTableStyles.module.css'

const HomerFormFields = ({ grid }) => {
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            File Label{' '}
            <HelperPopup
              content={
                'By default, this is the name of the uploaded file, but you can name it whatever you want.'
              }
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <Input onChange={grid.handleLabelChange} value={grid.fileLabel} size="small" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Description{' '}
            <HelperPopup
              content={"Description is to help you remember what's unique about this file."}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <Input
              onChange={grid.handleDescriptionChange}
              value={grid.fileDescription}
              size="small"
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} position="right center" />
          </Table.Cell>
          <Table.Cell>{grid.powerType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Battery Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the battery you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{grid.batteryType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            PV Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the PV system you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{grid.pvType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Generator Type{' '}
            <HelperPopup
              position="right center"
              content={
                'This is determined by reading the headers of the HOMER file. This is the generator you chose when you created the HOMER file.'
              }
            />
          </Table.Cell>
          <Table.Cell>{grid.generatorType}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(HomerFormFields))
