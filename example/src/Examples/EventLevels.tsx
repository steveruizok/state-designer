import * as React from "react"
import { createStateDesigner, useStateDesigner } from "state-designer"

const state = createStateDesigner({
  data: { items: {} },
  on: { INCREMENT_CLICKED: "setCount" },
  initial: "inactive",
  states: {
    inactive: {
      on: {
        INCREMENT_CLICKED: { to: "active" },
        START_CLICKED: { to: "active" }
      }
    },
    active: {
      on: {
        STOP_CLICKED: { to: "inactive" }
      }
    }
  },
  actions: {
    setCount(data) {
      data.items = {
        red: Math.random().toFixed(1),
        dark: Math.random().toFixed(1)
      }
    }
  }
})

const EventLevels: React.FC<{}> = () => {
  const { data, send, can } = useStateDesigner(state)

  return (
    <div className="example">
      <h2>Event Levels</h2>
      <p>Count: {Object.entries(data.items).join(", ")}</p>
      <button
        disabled={!can("START_CLICKED")}
        onClick={() => {
          send("START_CLICKED")
        }}
      >
        Start
      </button>
      <button
        disabled={!can("INCREMENT_CLICKED")}
        onClick={() => {
          console.log(send)
          send("INCREMENT_CLICKED")
        }}
      >
        Increment
      </button>
      <button
        disabled={!can("STOP_CLICKED")}
        onClick={() => {
          send("STOP_CLICKED")
        }}
      >
        Stop
      </button>
    </div>
  )
}

export default EventLevels
