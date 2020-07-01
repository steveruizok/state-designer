import * as React from "react"
import { Box } from "theme-ui"

const Node: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <Box
      sx={{
        alignSelf: "stretch",
        height: "100%",
        borderLeft: "dashed",
        borderColor: isActive ? "text" : "inactive",
      }}
    />
  )
}

export default Node
