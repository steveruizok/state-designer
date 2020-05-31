import * as React from "react"

import Start from "./scenes/Start"
import Playing from "./scenes/Playing"
import { Switches } from "./scenes/Tests/Switches"

export default function App() {
  return (
    <div className="App">
      <Playing />
      <Start />
      <Switches />
    </div>
  )
}
