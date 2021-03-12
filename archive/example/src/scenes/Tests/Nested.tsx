import * as React from "react"
import {
  S,
  createState,
  useStateDesigner,
  StateGraph,
} from "@state-designer/react"

function createCount(initial = 0) {
  const state = createState({
    data: { count: 0 },
    on: {
      INCREASED: {
        do: (data) => data.count++,
        secretlyDo: (data) => global.send("UPDATED_TOTAL"),
      },
      CLEARED_COUNT: {
        do: [() => console.log("clearing"), (data) => (data.count = 0)],
        secretlyDo: (data) => global.send("UPDATED_TOTAL"),
      },
    },
  })

  return state
}

const global = createState({
  data: {
    counters: [] as S.DesignedState<
      {
        count: number
      },
      {
        [x: string]: any
      }
    >[],
    total: 1,
  },
  on: {
    UPDATED_TOTAL: "updateTotal",
    ADDED_COUNTER: (data) => {
      data.counters.push(createCount())
    },
    CLEARED_TOTAL: ["clearCounters", "updateTotal"],
  },
  actions: {
    clearCounters(data) {
      data.counters.forEach((counter) => counter.send("CLEARED_COUNT"))
    },
    updateTotal(data) {
      let total = 0

      for (let counter of data.counters) {
        total += counter.data.count
      }

      data.total = total
    },
  },
})

type ChildProps = {
  counterState: S.DesignedState<
    {
      count: number
    },
    {
      [x: string]: any
    }
  >
}

export function Child(props: ChildProps) {
  const state = useStateDesigner(props.counterState)

  return (
    <div style={{ margin: 24, border: "1px solid #000" }}>
      Count: {state.data.count}
      <button onClick={() => state.send("INCREASED")}>Increase Count</button>
    </div>
  )
}

export function Parent() {
  const state = useStateDesigner(global)

  return (
    <div style={{ margin: 24 }}>
      Total: {state.data.total}
      <button onClick={() => state.send("ADDED_COUNTER")}>Add Counter</button>
      <button onClick={() => state.send("CLEARED_TOTAL")}>Clear Total</button>
      {state.data.counters.map((counter) => (
        <Child counterState={counter} />
      ))}
    </div>
  )
}
