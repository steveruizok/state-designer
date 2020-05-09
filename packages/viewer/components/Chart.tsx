import * as React from "react"
import { createStateDesigner } from "@state-designer/core"
import { useStateDesigner } from "@state-designer/react"

const state = createStateDesigner({
  data: { count: 0 },
  initial: "inactive",
  states: {
    inactive: {
      on: {
        TURNED_ON: { to: "active" },
      },
    },
    active: {
      on: {
        TURNED_OFF: { to: "inactive" },
        PLUSSED: (d) => d.count++,
      },
    },
  },
})

export const Chart: React.FC<{}> = () => {
  const { data, send, can, whenIn } = useStateDesigner(state)
  console.log(can("TURNED_ON"))
  return (
    <div>
      {data.count}
      <button onClick={() => send("TURNED_ON")}>turn on</button>
      <button onClick={() => send("TURNED_OFF")}>turn off</button>
      <button disabled={!can("PLUSSED")} onClick={() => send("PLUSSED")}>
        +1
      </button>
      Machine is {whenIn({ inactive: "inactive", active: "active" })}
    </div>
  )
}
