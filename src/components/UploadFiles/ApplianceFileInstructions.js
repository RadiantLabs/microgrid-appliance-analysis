import * as React from 'react'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import { Segment, Table, Icon, Grid } from 'semantic-ui-react'
import { saveFile } from '../../utils/saveFile'
import { undeletableApplianceFileId } from '../../utils/constants'

export const ApplianceFileInstructions = inject('store')(
  observer(({ store }) => {
    return (
      <Segment>
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <h3>Appliance File Upload Instructions</h3>
            </Grid.Column>
            <Grid.Column width={8}>
              <ExampleFileDownload />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <p>
                If you want to generate your own appliance usage file, the most pragmatic way would
                be to download the template and fill in your own kw_factor based on the appliance
                you are modeling. If you want to generate your own from the source generator, you
                can run this Jupyter notebook.{' '}
                <a
                  href="https://github.com/RadiantLabs/microgrid-appliance-usage-profile-generators"
                  target="_blank"
                  rel="noopener noreferrer">
                  Microgrid Appliance Usage Profile Generator
                </a>
              </p>
              <p>What does an uploaded appliance usage file look like?</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <ExampleFileTable />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <h3>Column Definitions</h3>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid>
          <ColumnDefinition
            col="datetime"
            def="Date format in ISO 8601 format, incrementing each hour for 8760 hours in a year."
          />
          <ColumnDefinition
            col="hour"
            def="Hour of the year, ranging from 0 to 8759 (first hour of year starts at zero)."
          />
          <ColumnDefinition
            col="day"
            def="A concatenation of the index of the day of the week (0 through 6) and the first 3 letters of the day of the week name. This is used for analyzing usage by day of week."
          />
          <ColumnDefinition col="hour_of_day" def="Hour of the day, from 0 to 23" />
          <ColumnDefinition
            col="day_hour"
            def="A concatenation of the day column (0mon) and hour_of_day"
          />
          <ColumnDefinition
            col="kw_factor"
            def="The number of minutes an appliance was fully utilized, summed over an hour. If it
                was running at 50% RPM, the factor for 1 minute is less than if it was at 100% RPM.
                See the Microgrid Appliance Usage Profile Generator linked to above for more
                information."
          />
        </Grid>
      </Segment>
    )
  })
)

const ExampleFileTable = () => {
  return (
    <Table compact>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>datetime</Table.HeaderCell>
          <Table.HeaderCell>hour</Table.HeaderCell>
          <Table.HeaderCell>day</Table.HeaderCell>
          <Table.HeaderCell>hour_of_day</Table.HeaderCell>
          <Table.HeaderCell>day_hour</Table.HeaderCell>
          <Table.HeaderCell>kw_factor</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>2018-01-01 00:00:00</Table.Cell>
          <Table.Cell>0</Table.Cell>
          <Table.Cell>0mon</Table.Cell>
          <Table.Cell>0</Table.Cell>
          <Table.Cell>0mon_00</Table.Cell>
          <Table.Cell>0</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2018-01-01 01:00:00</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>0mon</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>0mon_01</Table.Cell>
          <Table.Cell>0.0015</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2018-01-01 02:00:00</Table.Cell>
          <Table.Cell>2</Table.Cell>
          <Table.Cell>0mon</Table.Cell>
          <Table.Cell>2</Table.Cell>
          <Table.Cell>0mon_02</Table.Cell>
          <Table.Cell>0.04667</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2018-01-01 03:00:00</Table.Cell>
          <Table.Cell>3</Table.Cell>
          <Table.Cell>0mon</Table.Cell>
          <Table.Cell>3</Table.Cell>
          <Table.Cell>0mon_03</Table.Cell>
          <Table.Cell>0.00068</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={6} textAlign="center">
            — 8760 total hours in a year —
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2018-12-31 23:00:00</Table.Cell>
          <Table.Cell>8759</Table.Cell>
          <Table.Cell>0mon</Table.Cell>
          <Table.Cell>23</Table.Cell>
          <Table.Cell>0mon_23</Table.Cell>
          <Table.Cell>0</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

const ExampleFileDownload = inject('store')(
  observer(({ store }) => {
    const { appliances } = store
    const applianceTemplate = _.find(appliances, appliance => {
      return appliance.fileInfo.id === undeletableApplianceFileId
    })
    return (
      <div
        style={{ cursor: 'pointer', float: 'right' }}
        onClick={saveFile.bind(null, applianceTemplate.fileData, 'appliance_usage_template.csv')}>
        Download Appliance Template{' '}
        <Icon.Group size="large">
          <Icon name="file outline" />
          <Icon
            corner="bottom right"
            name="arrow circle down"
            style={{ transform: 'rotate(90deg)' }}
          />
        </Icon.Group>
      </div>
    )
  })
)

const ColumnDefinition = ({ col, def }) => {
  return (
    <Grid.Row>
      <Grid.Column width={2}>
        <strong>{col}</strong>
      </Grid.Column>
      <Grid.Column width={14}>{def}</Grid.Column>
    </Grid.Row>
  )
}
