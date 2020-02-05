import React from "react"
import Counter from "./Examples/Counter"
import Switch from "./Examples/Switch"
import NestedStates from "./Examples/NestedStates"
import Chain from "./Examples/Chain"
import DeepLink from "./Examples/DeepLink"
import OnEvent from "./Examples/OnEvent"
import Blended from "./Examples/Blended"
import Editor from "./Editor"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  return (
    <div>
      {/* <h1>State Designer</h1>
      <hr /> */}
      {/* <Blended />
      <Counter />
      <Switch />
      <NestedStates />
      <Chain />
      <DeepLink />
      <OnEvent /> */}
      <Editor />
    </div>
  )
}

export default App
