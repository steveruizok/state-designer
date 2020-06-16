import * as React from "react"
import { Heading, Box } from "theme-ui"

export const Panel: React.FC<{}> = ({ children }) => {
  return (
    <Box
      sx={{
        mb: 3,
        "& ul": {
          paddingLeft: 0,
          margin: 0,
          listStyle: "none",
        },
      }}
    >
      {children}
    </Box>
  )
}
