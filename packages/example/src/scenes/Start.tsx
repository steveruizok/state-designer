import * as React from "react"
// import { useStateDesigner } from "@state-designer/react"
import {
  createState,
  useStateDesigner,
  StateGraph,
} from "@state-designer/react"
import { motion, useMotionValue } from "framer-motion"

function Todo({ id = 0, content = "", complete = false }) {
  const state = useStateDesigner(
    {
      data: {
        id,
        content,
      },
      initial: complete ? "complete" : "incomplete",
      states: {
        incomplete: {
          on: {
            CHANGED_CONTENT: { do: "setContent" },
          },
          initial: {
            if: "contentIsEmpty",
            to: "empty",
            else: { to: "full" },
          },
          states: {
            empty: {
              on: {
                CHANGED_CONTENT: {
                  unless: "contentIsEmpty",
                  to: "full",
                },
              },
            },
            full: {
              onEnter: () => console.log("in fyul!"),
              on: {
                TOGGLED_COMPLETE: { to: "complete" },
                CHANGED_CONTENT: {
                  if: "contentIsEmpty",
                  to: "empty",
                },
              },
            },
          },
        },
        complete: {
          on: {
            TOGGLED_COMPLETE: { to: "incomplete" },
          },
        },
      },
      conditions: {
        contentIsEmpty(data) {
          return data.content === ""
        },
      },
      actions: {
        setContent(data, payload) {
          data.content = payload
        },
      },
    },
    []
  )

  return (
    <div style={{ margin: 24 }}>
      <input
        type="checkbox"
        disabled={state.isIn("empty")}
        checked={state.isIn("complete")}
        onChange={() => state.send("TOGGLED_COMPLETE")}
      />
      <input
        disabled={state.isIn("complete")}
        value={state.data.content}
        onChange={(e) => state.send("CHANGED_CONTENT", e.target.value)}
      />
      <StateGraph state={state} />
    </div>
  )
}

const Follower: React.FC<{}> = () => {
  const x = useMotionValue(0)
  const { send } = useStateDesigner({
    on: {
      MOUSE_MOVED: {
        secretlyDo: (_, payload) => {
          x.set(payload)
        },
      },
    },
  })

  return (
    <div
      style={{ height: "100vh", width: "100vw" }}
      onMouseMove={(e) => {
        send("MOUSE_MOVED", e.pageX)
      }}
    >
      <motion.div
        style={{
          x,
          height: 64,
          width: 64,
          borderRadius: "100%",
          backgroundColor: "var(--gb-accent)",
        }}
      >
        hi
      </motion.div>
    </div>
  )
}

const WhileTest: React.FC<{}> = () => {
  const { send, whenIn } = useStateDesigner({
    initial: "notToggled",
    states: {
      toggled: {
        on: {
          TOGGLE: { to: "notToggled" },
        },
      },
      notToggled: {
        on: {
          TOGGLE: { to: "toggled" },
        },
      },
    },
  })

  return (
    <button onClick={() => send("TOGGLE")}>
      {whenIn({
        toggled: "Toggled!",
        default: "Not toggled!",
      })}
    </button>
  )
}

const state = createState({
  data: {
    count: 0,
  },
  repeat: {
    onRepeat: (d) => d.count++,
    delay: 0.1,
  },
})

const Counter: React.FC = () => {
  const { data } = useStateDesigner(state)
  return <div>{data.count}</div>
}

const Counters: React.FC = () => {
  const [showCounter1, setShowCounter1] = React.useState(false)
  const [showCounter2, setShowCounter2] = React.useState(false)
  return (
    <div>
      <button onClick={() => setShowCounter1(!showCounter1)}>
        Toggle Counter
      </button>
      {showCounter1 && <Counter />}
      <button onClick={() => setShowCounter2(!showCounter2)}>
        Toggle Counter
      </button>
      {showCounter2 && <Counter />}
    </div>
  )
}

const Start: React.FC<{}> = () => {
  return (
    <div>
      {/* <Counters />
      <WhileTest />
      <Follower /> */}
      <Todo content="Hello world!" complete={false} id={1} />
      <Todo content="" complete={false} id={1} />
    </div>
  )
}

export default Start
