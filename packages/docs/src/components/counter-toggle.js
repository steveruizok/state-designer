import React from "react"
import { useStateDesign } from "@state-designer/react"

function CounterToggleReact() {
  const [count, setCount] = React.useState(0)
  const [isOn, setIsOn] = React.useState(false)
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setIsOn(!isOn)}>
        {isOn ? "Turn off" : "Turn on"}
      </button>
      <button disabled={!isOn} onClick={() => setCount(count + 1)}>
        -
      </button>
      <button disabled={!isOn} onClick={() => setCount(count - 1)}>
        +
      </button>
    </div>
  )
}

export function CounterToggle() {
  const { data, send, can, whenIn } = useStateDesign({
    data: { count: 0 },
    initial: "inactive",
    states: {
      inactive: {
        on: {
          TOGGLED: { to: "active" },
        },
      },
      active: {
        on: {
          CLICKED_PLUS: { unless: "atMax", do: "increment" },
          CLICKED_MINUS: { unless: "atMin", do: "decrement" },
          TOGGLED: { to: "inactive" },
        },
      },
    },
    actions: {
      increment(data) {
        data.count++
      },
      decrement(data) {
        data.count--
      },
    },
    conditions: {
      atMin(data) {
        return data.count === 0
      },
      atMax(data) {
        return data.count === 10
      },
    },
  })

  return (
    <div className="live-view container">
      <h1>{data.count}</h1>
      <div className="button-group">
        <button onClick={() => send("TOGGLED")}>
          {whenIn({
            active: "Turn Off",
            inactive: "Turn On",
          })}
        </button>
        <button
          disabled={!can("CLICKED_MINUS")}
          onClick={() => send("CLICKED_MINUS")}
        >
          -
        </button>
        <button
          disabled={!can("CLICKED_PLUS")}
          onClick={() => send("CLICKED_PLUS")}
        >
          +
        </button>
      </div>
    </div>
  )
}
