import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { motion, useMotionValue } from "framer-motion"

const Follower: React.FC<{}> = () => {
  const x = useMotionValue(0)
  const { send } = useStateDesigner({
    on: {
      MOUSE_MOVED: {
        secretlyDo: (data, payload) => {
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

const Start: React.FC<{}> = () => {
  return (
    <div>
      <WhileTest />
      <Follower />
    </div>
  )
}

export default Start
