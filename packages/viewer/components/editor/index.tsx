import * as React from "react"
import { Box } from "theme-ui"
import { ContentPanel } from "./ContentPanel"
import { CollectionsPanel } from "./CollectionsPanel"
import { Inspector } from "./Inspector"
import { Simulation } from "./Simulation"

export const Editor: React.FC<{}> = () => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto auto auto 1fr",
        gridTemplateRows: ["auto", "100vh"],
        overflowY: "scroll",
      }}
    >
      <ContentPanel />
      <Inspector />
      <CollectionsPanel />
      <Simulation />
    </Box>
  )
}
