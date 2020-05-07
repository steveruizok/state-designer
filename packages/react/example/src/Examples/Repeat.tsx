import * as React from "react"
import { useStateDesigner } from "state-designer"

const Repeat: React.FC<{}> = () => {
  const { data, send, can } = useStateDesigner({
    data: {
      count: 0,
    },
    initial: "slow",
    states: {
      slow: {
        repeat: {
          event: (data) => data.count++,
          delay: 1,
        },
        on: {
          STARTED_FAST: { to: "fast" },
        },
      },
      fast: {
        repeat: {
          event: (data) => data.count++,
          delay: 0.1,
        },
        on: {
          STARTED_SLOW: { to: "slow" },
        },
      },
    },
  })

  return (
    <div className="example">
      <h2>{data.count}</h2>
      <div className="button-group">
        <button
          onMouseDown={() => send("STARTED_FAST")}
          onMouseUp={() => send("STARTED_SLOW")}
        >
          Fast
        </button>
      </div>
    </div>
  )
}

export default Repeat
