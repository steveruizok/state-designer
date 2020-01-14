import React from "react"
import Counter from "./Examples/Counter"
import Switch from "./Examples/Switch"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  return (
    <div className="app">
      <h1>State Designer</h1>
      <hr />
      <Counter />
      <Switch />
    </div>
  )
}

export default App
