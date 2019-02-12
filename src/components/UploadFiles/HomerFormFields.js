import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Input } from 'semantic-ui-react'
import { HelperPopup } from 'components/Elements/HelperPopup'
import borderlessTableStyles from 'styles/borderlessTableStyles.module.css'

const HomerFormFields = ({ store }) => {
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            File Name{' '}
            <HelperPopup
              content={
                'By default, this is the name of the uploaded file, but you can name it whatever you want. It has to be unique compared to other HOMER files uploaded.'
              }
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <Input
              onChange={store.stagedGrid.onNameChange}
              value={store.stagedGrid.fileName}
              size="small"
            />
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
              onChange={store.stagedGrid.onDescriptionChange}
              value={store.stagedGrid.fileDescription}
              size="small"
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} position="right center" />
          </Table.Cell>
          <Table.Cell>{store.stagedGrid.powerType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Battery Type{' '}
            <HelperPopup
              content={
                'This is determined by reading the headers of the HOMER file. This is the battery you chose when you created the HOMER file.'
              }
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>{store.stagedGrid.batteryType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            PV Type{' '}
            <HelperPopup
              content={
                'This is determined by reading the headers of the HOMER file. This is the PV system you chose when you created the HOMER file.'
              }
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>{store.stagedGrid.pvType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Generator Type{' '}
            <HelperPopup
              content={
                'This is determined by reading the headers of the HOMER file. This is the generator you chose when you created the HOMER file.'
              }
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>{store.stagedGrid.generatorType}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(HomerFormFields))
