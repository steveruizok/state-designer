import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Box } from "theme-ui"
import { ContentPanel } from "./ContentPanel"
import { CollectionsPanel } from "./CollectionsPanel"
import { Inspector } from "./Inspector"
import { Simulation } from "./Simulation"

export const Editor: React.FC<{}> = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: ["100%", "auto 480px 1fr 400px"],
        gridTemplateRows: ["auto", "100vh"],
        overflowY: "scroll",
      }}
    >
      <ContentPanel />
      <Inspector />
      <Simulation />
      <CollectionsPanel />
    </Box>
  )
}
