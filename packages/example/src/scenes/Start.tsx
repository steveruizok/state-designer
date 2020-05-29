import * as React from "react"
import { createState } from "@state-designer/core"
import {
  // createState,
  useStateDesigner,
  StateGraph,
} from "@state-designer/react"
import { motion, useMotionValue } from "framer-motion"
import { Todo } from "./Tests/Todo"

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

const Parallel: React.FC<{}> = () => {
  const { send, isIn, whenIn } = useStateDesigner({
    states: {
      filter: {
        states: {
          all: {
            on: {
              FILTERED_SOME: { to: "some" },
              FILTERED_NONE: { to: "none" },
            },
          },
          some: {
            on: {
              FILTERED_ALL: { to: "all" },
              FILTERED_NONE: { to: "none" },
            },
          },
          none: {
            on: {
              FILTERED_ALL: { to: "all" },
              FILTERED_SOME: { to: "some" },
            },
          },
        },
      },
    },
  })

  console.log(isIn("all"))

  return (
    <div style={{ margin: 32 }}>
      {whenIn(
        {
          all: <div>"All"</div>,
          some: <div>"Some"</div>,
          none: <div>"None"</div>,
        },
        "array"
      )}
    </div>
  )
}
const Start: React.FC<{}> = () => {
  return (
    <div>
      {/* <Counters />
      <WhileTest />
      <Follower /> */}
      <Parallel />
      <Todo content="Hello world!" complete={false} id={1} />
      <Todo content="" complete={false} id={1} />
    </div>
  )
}

export default Start
