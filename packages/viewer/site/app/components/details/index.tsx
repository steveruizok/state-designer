import * as React from "react"
import { Grid } from "theme-ui"
import Data from "./data"
import Values from "./values"
import Tests from "./tests"
import { Project } from "../../states"
import { useStateDesigner } from "@state-designer/react"
import { useMotionValue, PanInfo } from "framer-motion"
import DragHandle from "../drag-handle"

const Details: React.FC = (props) => {
  const local = useStateDesigner(Project)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  const mvColum1Width = useMotionValue(0)
  const rOffset1 = React.useRef(0)

  const resetColumns = React.useCallback(() => {
    rOffset1.current = 0
    document.documentElement.style.setProperty(
      "--details-column1-offset",
      "0px"
    )
  }, [])

  const handleDragHandle1Change = React.useCallback((e: any, info: PanInfo) => {
    const offset = rOffset1.current
    const next = info.delta.x + offset
    rOffset1.current = next

    document.documentElement.style.setProperty(
      "--details-column1-offset",
      -next + "px"
    )
  }, [])

  return (
    <Grid
      sx={{
        overflow: "hidden",
        position: "relative",
        gridAutoFlow: "column",
        gridTemplateColumns:
          "auto clamp(5%, 85%, calc(50% + var(--details-column1-offset)))",
        borderTop: "outline",
        borderColor: "border",
        gap: 0,
      }}
    >
      <Data data={captive.data} />
      <Values values={captive.values}>
        <DragHandle
          initial={0}
          min={0}
          max={0}
          align={"left"}
          motionValue={mvColum1Width}
          onPan={handleDragHandle1Change}
          onDoubleClick={resetColumns}
        ></DragHandle>
      </Values>
    </Grid>
  )
}
export default Details
