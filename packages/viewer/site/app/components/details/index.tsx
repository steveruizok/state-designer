import * as React from "react"
import { Box, Grid } from "theme-ui"
import Data from "./data"
import Values from "./values"
import { Project } from "../../states"
import { useStateDesigner } from "@state-designer/react"
import { useMotionValue, PanInfo } from "framer-motion"
import DragHandle from "../drag-handle"

const Details: React.FC = (props) => {
  const local = useStateDesigner(Project)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  const mvColumWidth = useMotionValue(0)
  const rOffset = React.useRef(0)

  const resetColumns = React.useCallback(() => {
    rOffset.current = 0

    document.documentElement.style.setProperty("--details-column-offset", "0px")
  }, [])

  const handleDragHandleChange = React.useCallback((e: any, info: PanInfo) => {
    const offset = rOffset.current
    const next = info.delta.x + offset
    rOffset.current = next

    document.documentElement.style.setProperty(
      "--details-column-offset",
      -next + "px"
    )
  }, [])

  return (
    <Grid
      sx={{
        overflow: "hidden",
        position: "relative",
        gridArea: "detail",
        gridAutoFlow: "column",
        gridTemplateColumns:
          "auto clamp(10%, 90%, calc(50% + var(--details-column-offset)))",
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
          motionValue={mvColumWidth}
          onPan={handleDragHandleChange}
          onDoubleClick={resetColumns}
        ></DragHandle>
      </Values>
    </Grid>
  )
}
export default Details
