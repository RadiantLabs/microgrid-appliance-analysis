import * as React from 'react'
import { Icon, Popup, Table, Modal } from 'semantic-ui-react'

export const UnmetLoadHelperPopup = content => (
  <Modal
    trigger={
      <Icon
        name="question circle outline"
        size="small"
        color="grey"
        style={{ cursor: 'pointer' }}
      />
    }
    closeIcon>
    <Modal.Header>Count of unmet load hours per year</Modal.Header>
    <Modal.Content>
      <p>
        This is the estimated number of hours that the grid can't support the load. This may be, for
        example, how many times per year the backup generator has to turn on.
      </p>
      <p>
        <strong>Q:</strong> What determines the threshold of unmet load vs met load?
      </p>
      <p>
        <strong>A:</strong> It depends on how we round it. HOMER generates files with an unmet load
        of 1x10^-16, which is extremely small and due to errors on how computers calculate numbers.
        So clearly some rounding needs to happen. But how much do we round it? The load units are kW
        and the time interval is 1 hour.
      </p>
      <ul>
        <li>3 decimals: 1 watt•hour</li>
        <li>2 decimals: 10 watt•hour</li>
        <li>
          <strong>1 decimals: 100 watt•hour</strong>
        </li>
        <li>0 decimals: 1 kilowatt•hour</li>
      </ul>
      <p>We chose to call anything above 100 watt•hours as an unmet load.</p>
      <p>
        <strong>Q:</strong> Why don't original and additional counts add up to total?
      </p>
      <p>
        <strong>A:</strong> These are counts of hours that the load is unmet. For a single hour,
        both the original and the additional load can be unmet. If we add these up, that's 2. But in
        reality, for that same hour, it's only unmet once. If we added up the kW (sum column) for
        that hour of both original and unmet, then it will equal the total (within rounding errors).
        Below is a table that shows how original and additional unmet load counts don't need to
        equal the total.
      </p>
      <Table compact celled collapsing>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Original Unmet Load</Table.HeaderCell>
            <Table.HeaderCell>Additional Unmet Load</Table.HeaderCell>
            <Table.HeaderCell>Total Unmet Load</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>0</Table.Cell>
            <Table.Cell>1</Table.Cell>
            <Table.Cell>1</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>1</Table.Cell>
            <Table.Cell>2</Table.Cell>
            <Table.Cell>3</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>2</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>2</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>4</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>4</Table.Cell>
          </Table.Row>
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell>Count of values above zero</Table.HeaderCell>
            <Table.HeaderCell>3</Table.HeaderCell>
            <Table.HeaderCell>2</Table.HeaderCell>
            <Table.HeaderCell>4</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell>Sum</Table.HeaderCell>
            <Table.HeaderCell colSpan={2}>Original + Additional: 5</Table.HeaderCell>
            <Table.HeaderCell>Total: 4</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell colSpan={3}>Original + Additional (5) > Total (4)</Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Modal.Content>
  </Modal>
)
