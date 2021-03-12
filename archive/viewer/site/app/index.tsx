import * as React from "react"
import CodeColumn from "./components/code"
import Menu from "./components/menu"
import Main from "./components/main"
import Title from "./components/title"
import Layout from "./components/layout"
import Content from "./components/content"
import DetailRow from "./components/details"
import Controls from "./components/controls"
import Tabs from "./components/tabs"

const Viewer: React.FC<{ authenticated: boolean }> = ({ authenticated }) => {
  return (
    <Layout>
      <Menu />
      <Title />
      <Controls />
      <Content />
      <Main />
      <Tabs />
      <CodeColumn authenticated={authenticated} />
      <DetailRow />
    </Layout>
  )
}

export default Viewer
