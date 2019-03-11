import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Input } from 'semantic-ui-react'
import { HelperPopup } from 'src/components/Elements/HelperPopup'
import borderlessTableStyles from 'src/styles/borderlessTableStyles.module.css'

const HomerFormFields = ({ store }) => {
  const { viewedAppliance } = store
  const {
    fileLabel,
    fileDescription,
    powerType,
    powerFactor,
    phase,
    hasMotor,
    handleLabelChange,
    handleDescriptionChange,
  } = viewedAppliance
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
            <Input onChange={handleLabelChange} value={fileLabel} size="small" />
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
            <Input onChange={handleDescriptionChange} value={fileDescription} size="small" />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Type <HelperPopup content={'AC ⚡ DC'} position="right center" />
          </Table.Cell>
          <Table.Cell>{powerType}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Power Factor <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>{powerFactor}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Phase <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>{phase}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Has Motor? <HelperPopup position="right center" content={'TODO'} />
          </Table.Cell>
          <Table.Cell>{hasMotor ? 'Yes' : 'No'}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(HomerFormFields))
