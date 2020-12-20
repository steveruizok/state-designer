import * as React from "react"
import CodeColumn from "./components/code"
import Menu from "./components/menu"
import Main from "./components/main"
import Title from "./components/title"
import Layout from "./components/layout"
import Content from "./components/content"
import Controls from "./components/controls"
import Tabs from "./components/tabs"

const Viewer: React.FC<{ authenticated: boolean; owner: boolean }> = ({
  authenticated,
  owner,
}) => {
  return (
    <Layout>
      <Menu />
      <Title />
      <Controls />
      <Content />
      <Main />
      <Tabs />
      <CodeColumn authenticated={authenticated} owner={owner} />
    </Layout>
  )
}

export default Viewer
