import * as React from 'react'
import { Grid, Header, Segment, Image } from 'semantic-ui-react'
import logo from 'images/factore-logo.png'

const About = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column width={10}>
        <Segment>
          <Image src={logo} size="small" floated="left" />
          <p>
            <big>
              Our mission is to improve lives in the developing world through increased access to
              sustainable energy and related services. We believe that technology can be a profound
              driver of positive impact, and we work closely with early stage entrepreneurs to
              transform their ideas into market-based solutions.
            </big>
          </p>
        </Segment>
      </Grid.Column>
      <Grid.Column width={6}>
        <Segment>
          <Header as="h3">Contact</Header>
          <Grid>
            <Grid.Row>
              <Grid.Column width={3}>
                <Image src="https://react.semantic-ui.com/images/avatar/large/jenny.jpg" />
              </Grid.Column>
              <Grid.Column width={13}>
                For general questions and comments about this app, contact{' '}
                <a href="http://#.com">Amanda DelCore</a>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}>
                <Image src="https://react.semantic-ui.com/images/avatar/large/justen.jpg" />
              </Grid.Column>
              <Grid.Column width={13}>
                For technical problems with this app, contact{' '}
                <a href="http://#.com">Jeff Friesen</a>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default About
