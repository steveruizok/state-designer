import * as React from "react"
import CodeColumn from "./components/code-column"
import Menu from "./components/menu"
import Main from "./components/main"
import Title from "./components/title"
import Layout from "./components/layout"
import Save from "./components/save"
import Content from "./components/content-column"
import DetailRow from "./components/detail-row"
import Controls from "./components/controls"
import Tabs from "./components/tabs"

const Viewer: React.FC<{}> = () => {
  return (
    <Layout>
      <Menu />
      <Title />
      <Controls />
      <Content />
      <Main />
      <Tabs />
      <CodeColumn />
      <DetailRow />
    </Layout>
  )
}

export default Viewer
