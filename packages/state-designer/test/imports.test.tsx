import * as React from "react"
import * as ReactDOM from "react-dom"

import { createConfig, createStateDesigner, useStateDesigner } from "../src"

const config = createConfig({
  data: { count: 0 },
  on: {
    ADDED_ONE: (d) => d.count++,
  },
})

const state = createStateDesigner(config)

describe("createConfig", () => {
  it("Should create a config.", () => {
    expect(config).toBeTruthy()
  })
})

describe("createStateDesigner", () => {
  it("Should create a state.", () => {
    expect(state).toBeTruthy()
  })
})

describe("useStateDesigner", () => {
  it("should support the hook.", () => {
    const App = () => {
      const { data, send } = useStateDesigner(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const div = document.createElement("div")
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
