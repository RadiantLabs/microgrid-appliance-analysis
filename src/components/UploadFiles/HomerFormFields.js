import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Table } from 'semantic-ui-react'
import InputField from '../../components/Elements/InputField'
import { HelperPopup } from '../../components/Elements/HelperPopup'
import borderlessTableStyles from '../../styles/borderlessTableStyles.module.css'
import { fieldDefinitions } from '../../utils/fieldDefinitions'

const HomerFormFields = ({ grid }) => {
  const { fileErrors, fileWarnings } = grid
  return (
    <Table basic="very" celled collapsing compact className={borderlessTableStyles.borderless}>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['label'].title}{' '}
            <HelperPopup content={fieldDefinitions['label'].description} position="right center" />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="label" modelInstance={grid} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {fieldDefinitions['description'].title}{' '}
            <HelperPopup
              content={fieldDefinitions['description'].description}
              position="right center"
            />
          </Table.Cell>
          <Table.Cell>
            <InputField fieldKey="description" modelInstance={grid} />
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
        <Table.Row>
          <Table.Cell>File Upload Warnings </Table.Cell>
          <Table.Cell>
            <FileUploadErrors fileErrors={fileWarnings} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>File Upload Errors </Table.Cell>
          <Table.Cell>
            <FileUploadErrors fileErrors={fileErrors} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default inject('store')(observer(HomerFormFields))

const FileUploadErrors = ({ fileErrors }) => {
  if (_.isEmpty(fileErrors)) {
    return 'None Found'
  }
  return (
    <div>
      {_.map(fileErrors, error => (
        <div key={error}>{error}</div>
      ))}
    </div>
  )
}
