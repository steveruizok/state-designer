import React from "react"
import routes from "routes"
import { Route } from "react-router-dom"
import { Layout, TitleBar, Footer, NavLinks } from "components"

export default function App() {
  return (
    <div style={{ padding: "0px 8px" }}>
      <TitleBar />
      <Route exact path="/">
        <Layout justifyContent="center">
          <NavLinks />
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
