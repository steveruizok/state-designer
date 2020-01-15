import React from "react"
import Counter from "./Examples/Counter"
import Switch from "./Examples/Switch"
import NestedStates from "./Examples/NestedStates"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  return (
    <div className="app">
      <h1>State Designer</h1>
      <hr />
      <Counter />
      <Switch />
      <NestedStates />
    </div>
  )
}

export default App
