import React from "react"
import routes from "routes"
import { Route } from "react-router-dom"
import { Heading, Text } from "@chakra-ui/core"
import { Layout, TitleBar, HStack, VStack, Footer, NavLinks } from "components"

export default function App() {
  return (
    <div style={{ padding: "0px 8px" }}>
      <TitleBar />
      <Route exact path="/">
        <Layout w="100%" maxWidth={720} mb={4}>
          <VStack gap={5}>
            <Heading>State Designer Tutorials</Heading>
            <Text>
              Welcome to the State Designer tutorials website. You can use this
              website to learn about the State Designer library by viewing and
              completing the following projects:
            </Text>
            <HStack pl={5} my={7}>
              <NavLinks />
            </HStack>
            <Text>
              Each project has a <b>starter</b> version and a <b>complete</b>{" "}
              version. The starter version contains only presentational
              components. The complete version shows those same components
              connected to a working state design.
            </Text>
            <Heading as="h2" size="lg">
              Getting Started
            </Heading>
            <Text>
              Click the link below to open this website's source code in
              CodeSandbox. Then click on the <b>Fork</b> button to create a copy
              that you can edit yourself.
            </Text>
            <a
              _target="none"
              href="https://codesandbox.io/s/github/steveruizok/state-designer/tree/master/packages/tutorials"
            >
              <img
                alt="Edit steveruizok/state-designer: tutorials"
                src="https://codesandbox.io/static/img/play-codesandbox.svg"
              />
            </a>
            <Text>
              To work on an tutorial, open the tutorial's starter link in the
              CodeSandbox Browser. Then edit the source of the starter so that
              it matches the functionality in its completed version.
            </Text>{" "}
            <Text>
              For example, to work on the <b>counter</b> tutorial, edit the file
              at:
            </Text>
            <pre>
              <a href="https://codesandbox.io/s/github/steveruizok/state-designer/tree/master/packages/tutorials?file=/src/tutorials/1_counter/starter/index.js">
                <code>src/tutorials/1_toggle/starter/index.js</code>
              </a>
            </pre>
            <Text>Good luck!</Text>
          </VStack>
        </Layout>
      </Route>
      {routes.map(({ name, Starter, Complete }, i) => (
        <React.Fragment key={i}>
          <Route exact path={`/${name}-starter`} component={Starter} />
          <Route exact path={`/${name}-complete`} component={Complete} />
        </React.Fragment>
      ))}
      <footer>
        <Footer />
      </footer>
    </div>
  )
}
