import * as React from "react"
import Column from "./column"
import { editor } from "../states/editor"
import { presentation } from "../states/presentation"
import { ui } from "../states/ui"
import { useStateDesigner } from "@state-designer/react"
import ReactEditor from "./code/react-editor"
import StateEditor from "./code/state-editor"
import SaveRow from "./code/save-row"
import { motion } from "framer-motion"

const CodeColumn: React.FC = (props) => {
  const local = useStateDesigner(ui)

  return (
    <Column
      sx={{
        gridArea: "code",
        position: "relative",
        p: 0,
        borderLeft: "outline",
        borderColor: "border",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "100% 100%",
          gridTemplateRows: "1fr 40px",
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 800,
          restDelta: 1,
          restSpeed: 1,
          mass: 0.9,
        }}
        variants={{
          state: { x: 0 },
          presentation: { x: "-100%" },
        }}
        animate={local.whenIn({
          state: "state",
          presentation: "presentation",
        })}
      >
        <StateEditor key={"state"} />
        <ReactEditor key={"react"} />
        {ui.data.isOwner && <SaveRow state={editor} />}
        {ui.data.isOwner && <SaveRow state={presentation} />}
      </motion.div>
    </Column>
  )
}

export default CodeColumn
