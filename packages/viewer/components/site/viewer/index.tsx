import * as React from "react"
import Code from "./components/code"
import Menu from "./components/menu"
import Main from "./components/main"
import Title from "./components/title"
import Layout from "./components/layout"
import Save from "./components/save"
import Content from "./components/content"
import DetailRow from "./components/detail-row"
import Controls from "./components/controls"
import { editor } from "./states/editor"
import { ui } from "./states/ui"
import { useFirebaseCode } from "./hooks/useFirebaseCode"

const Viewer: React.FC<{}> = () => {
  return (
    <Layout>
      <Menu />
      <Title />
      <Controls />
      <Content />
      <Main />
      <Code />
      <DetailRow />
      <Save />
    </Layout>
  )
}

export default Viewer
