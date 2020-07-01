// @jsx jsx
import * as React from "react"
import { jsx, Box, IconButton } from "theme-ui"
import { RefreshCw } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import { useMotionValue } from "framer-motion"
import { Project } from "../../states"
import Preview from "./preview"
import Chart from "./chart"

const Main: React.FC = () => {
  const local = useStateDesigner(Project)
  const stateScale = useMotionValue(1)

  return (
    <Box
      sx={{
        gridArea: "main",
        position: "relative",
        overflow: "hidden",
        "& *[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover:not([disabled]) *[data-hidey='true']": {
          visibility: "visible",
        },
      }}
    >
      {local.whenIn({
        "tabs.state": <Chart mvScale={stateScale} />,
        default: <Preview />,
      })}

      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", bottom: 0, right: 0 }}
        title="Reset State"
        onClick={() => Project.data.captive?.reset()}
      >
        <RefreshCw />
      </IconButton>
    </Box>
  )
}

export default Main
