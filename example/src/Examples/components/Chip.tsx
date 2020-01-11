import React from "react"
import { Box } from "@theme-ui/components"

export interface Props {}

export const Chip: React.FC<Props> = ({ children }) => {
  return (
    <Box
      p={2}
      px={3}
      mr={2}
      backgroundColor="muted"
      color="text"
      sx={{
        border: "1px solid #ccc",
        display: "inline-block",
        borderRadius: 999
      }}
    >
      {children}
    </Box>
  )
}
