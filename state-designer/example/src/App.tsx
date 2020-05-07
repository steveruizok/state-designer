import React from "react"
import "./App.css"
import { createStateDesigner, useStateDesigner } from "@state-designer/react"

const state = createStateDesigner({
  data: { count: 0 },
  on: {
    INCREMENTED: "increment",
    INCREMENTED_TWICE: ["increment", "increment"],
  },
  onEvent: {
    if: (d) => d.count >= 10,
    to: "warn",
  },
  initial: "safe",
  states: {
    warn: {},
    safe: {},
  },
  actions: {
    increment(d) {
      d.count++
    },
  },
})

function App() {
  const { data, send, whenIn, isIn, stateTree } = useStateDesigner(state)

  return (
    <div className="App">
      <h2>{data.count}</h2>
      <button onClick={() => send("INCREMENTED")}>+1</button>
      <button onClick={() => send("INCREMENTED_TWICE")}>+2</button>
      {whenIn({
        safe: "safe!",
        warn: "warn!",
      })}
      <pre>
        {JSON.stringify(
          stateTree,
          function (key, val) {
            return typeof val === "function" ? "" + val.name : val
          },
          2
        )}
      </pre>
    </div>
  )
}

export default App
