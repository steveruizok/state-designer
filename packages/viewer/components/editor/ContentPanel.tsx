// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState from "./state"
import { DataEditor } from "./DataEditor"
import { StateTree } from "./StateTree"
import { EventList } from "./EventList"
import { motion, useMotionValue, useAnimation } from "framer-motion"
import { Divider, Heading } from "theme-ui"

export const ContentPanel: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)
  const width = useMotionValue(357)
  const animation = useAnimation()

  return (
    <motion.div style={{ width }}>
      <motion.div
        style={{
          width: 3,
          height: "100%",
          position: "absolute",
          left: 0,
          borderLeft: "1px solid rgba(93, 90, 105, 1.000)",
          cursor: "ew-resize",
          x: width,
          zIndex: 999,
        }}
        drag="x"
        dragMomentum={false}
        dragConstraints={{
          left: 200,
          right: 600,
        }}
        animate={animation}
        onDoubleClick={() => animation.start({ x: 358 })}
      />
      <StateTree />
      {/* <Divider /> */}
      <EventList />
      {/* <Divider /> */}
      <DataEditor
        code={global.data.data}
        onChangeCode={(code) => global.send("CHANGED_DATA", code)}
      />
    </motion.div>
    // </Column>
  )
}
