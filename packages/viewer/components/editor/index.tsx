import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Box } from "theme-ui"
import { ContentPanel } from "./ContentPanel"
import { Inspector } from "./Inspector"
import { Simulation } from "./Simulation"

export const Editor: React.FC<{}> = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: ["100%", "360px 480px 1fr"],
        gridTemplateRows: ["auto", "100vh"],
        overflowY: "scroll",
      }}
    >
      <ContentPanel />
      <Inspector />
      <Simulation />
    </Box>
  )
}
