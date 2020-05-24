import * as React from "react"
import * as ReactDOM from "react-dom"

import { createConfig, createStateDesign, useStateDesign } from "../"

const configObject = {
  data: { count: 0 },
  on: {
    ADDED_ONE: (d: any) => d.count++,
  },
}

const config = createConfig(configObject)

const state = createStateDesign(config)

describe("createConfig", () => {
  it("Should create a config.", () => {
    expect(config).toBeTruthy()
  })
})

describe("createStateDesign", () => {
  it("Should create a state.", () => {
    expect(state).toBeTruthy()
  })
})

describe("useStateDesign", () => {
  it("Should create / subscribe to a local state from an external config.", () => {
    const CounterFromConfig = () => {
      const { data, send } = useStateDesign(config)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const div = document.createElement("div")
    ReactDOM.render(<CounterFromConfig />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it("Should create / subscribe to a local state from local config.", () => {
    const CounterFromLocalConfig = () => {
      const { data, send } = useStateDesign(configObject)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const div = document.createElement("div")
    ReactDOM.render(<CounterFromLocalConfig />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it("Should subscribe to an external state (created by createStateDesign).", () => {
    const CounterFromState = () => {
      const { data, send } = useStateDesign(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const div = document.createElement("div")
    ReactDOM.render(<CounterFromState />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it("Should subscribe multiple components to the same external state.", () => {
    const SharedCounterA = () => {
      const { data, send } = useStateDesign(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const SharedCounterB = () => {
      const { data, send } = useStateDesign(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send("ADDED_ONE")}>+1</button>
        </div>
      )
    }

    const App = () => {
      return (
        <div>
          <SharedCounterA />
          <SharedCounterB />
        </div>
      )
    }

    const div = document.createElement("div")
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
