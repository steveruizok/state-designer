import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { motion, useMotionValue } from "framer-motion"

const Start: React.FC<{}> = () => {
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

export default Start
