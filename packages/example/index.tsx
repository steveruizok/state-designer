import "react-app-polyfill/ie11"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { padStart } from "lodash"
import {
  createConfig,
  createStateDesigner,
  useStateDesigner,
} from "@state-designer/react"

const config = createConfig({
  data: { count: 0, ms: 0 },
  on: {},
  initial: "inactive",
  states: {
    inactive: {
      on: {
        TOGGLE: {
          to: "active",
        },
      },
      // repeat: {
      //   event: [
      //     (d, _, { elapsed }) => {
      //       d.ms = elapsed
      //     },
      //   ],
      // },
    },
    active: {
      on: {
        TOGGLE: { to: "inactive" },
        CLICKED_PLUS: { do: "increment" },
        CLICKED_MINUS: { do: "increment" },
        ADDED_BY: { do: "incrementBy" },
      },
    },
  },
  actions: {
    increment(d) {
      d.count++
    },
    incrementBy(d, p) {
      d.count += p
    },
  },
  values: {
    milliseconds(d) {
      return padStart((Math.floor(d.ms / 10) % 100).toString(), 2, "0")
    },
    seconds(d) {
      return padStart((Math.floor(d.ms / 1000) % 60).toString(), 2, "0")
    },
    minutes(d) {
      return padStart(Math.floor(d.ms / 60000).toString(), 2, "0")
    },
  },
})

const state = createStateDesigner(config)

function Checkbox({ checked = false }) {
  const { isIn, send } = useStateDesigner(
    {
      initial: checked ? "checked" : "unchecked",
      states: {
        checked: {
          on: { TOGGLE: { to: "unchecked" } },
        },
        unchecked: {
          on: { TOGGLE: { to: "checked" } },
        },
      },
    },
    [checked]
  )

  return (
    <input
      type="checkbox"
      checked={isIn("checked")}
      onChange={() => send("TOGGLE")}
    />
  )
}

const App = () => {
  const [inputState, setInputState] = React.useState(0)
  const { data, send, values, isIn, whenIn, stateTree } = useStateDesigner(
    state
  )

  return (
    <div>
      <h3>{data.count}</h3>
      <h2>
        Seconds {values.minutes}:{values.seconds}:{values.milliseconds}
      </h2>
      <Checkbox checked={isIn("active")} />
      <button onClick={() => send("TOGGLE")}>Turn on</button>
      <button onClick={() => send("TOGGLE")}>Turn off</button>
      <hr />
      {whenIn({
        active: (
          <div key="activegroup">
            <button onClick={() => send("CLICKED_MINUS")}>-1</button>
            <button onClick={() => send("CLICKED_PLUS")}>+1</button>
            <input
              type="number"
              value={inputState || 0}
              onChange={(e) => setInputState(parseInt(e.target.value))}
            />
            <button onClick={() => send("ADDED_BY", inputState)}>Add</button>
          </div>
        ),
      })}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
