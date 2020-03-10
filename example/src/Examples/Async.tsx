import * as React from "react"
import { createStateDesigner, useStateDesigner } from "state-designer"

const state = createStateDesigner({
  data: {
    count: 0
  },
  initial: "connecting",
  states: {
    connecting: {
      async: {
        await: "fakeWait",
        onResolve: { do: "setCount", to: "connected" },
        onReject: { to: "disconnected" }
      }
    },
    connected: {},
    disconnected: {}
  },
  actions: {
    setCount(data, _, resolved) {
      const [count] = resolved
      data.count = count
    }
  },
  asyncs: {
    fakeWait: () => new Promise(resolve => setTimeout(() => resolve(10), 2000))
  }
})

const Delay: React.FC<{}> = () => {
  const { data, whenIn } = useStateDesigner(state)

  return (
    <div className="example">
      <h2>Async</h2>
      <h2>{data.count}</h2>
      <p>
        {whenIn({
          connecting: "connecting",
          connected: "connected",
          disconnected: "disconnected"
        })}
      </p>
    </div>
  )
}

export default Delay
