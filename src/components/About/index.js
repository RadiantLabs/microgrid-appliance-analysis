import * as React from 'react'
import { Grid, Header, Segment, Image } from 'semantic-ui-react'
import factoreLogo from 'images/factore-logo.png'
import radiantLogo from 'images/radiant-labs-logo@256w.png'
import softwareDiagram from 'images/minigrid-software-diagram.png'

const About = () => (
  <Grid padded>
    <Grid.Row>
      <Grid.Column width={10}>
        <Header as="h2">About this Software</Header>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <Image src={softwareDiagram} bordered />
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
                <a href="http://#.com">Amanda DelCore</a> at{' '}
                <a href="http://www.factore.com">Factor[e]</a>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}>
                <Image src="https://react.semantic-ui.com/images/avatar/large/justen.jpg" />
              </Grid.Column>
              <Grid.Column width={13}>
                For technical problems with this app, contact{' '}
                <a href="http://#.com">Jeff Friesen</a> at{' '}
                <a href="http://www.radiantlabs.co">Radiant Labs</a>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column>
        <Segment>
          <Image src={factoreLogo} size="small" floated="left" href="http://www.factore.com" />
          <p>
            Our mission is to improve lives in the developing world through increased access to
            sustainable energy and related services. We believe that technology can be a profound
            driver of positive impact, and we work closely with early stage entrepreneurs to
            transform their ideas into market-based solutions.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
          <p>
            Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea
            sprouts fava bean collard greens dandelion okra wakame tomato. Dandelion cucumber
            earthnut pea peanut soko zucchini.
          </p>
        </Segment>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column>
        <Header as="h5">In partnership with:</Header>
        <Segment>
          <Image src={radiantLogo} size="small" floated="left" href="http://www.radiantlabs.co" />
          <p>
            Radiant Labs builds tools that drive carbon reduction solutions for cities, states and
            utilities. We partner with organizations leading the field and driving the coming
            decades most important innovations.
          </p>
          <p />
        </Segment>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default About
