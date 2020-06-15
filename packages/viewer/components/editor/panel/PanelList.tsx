import * as React from "react"
import { Heading, Box } from "theme-ui"

export const PanelList: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: "active",
        "&:first-of-type": {
          borderColor: "transparent",
        },
        mb: 3,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 3,
          bg: "muted",
        }}
      >
        <Heading as="h3">{title}</Heading>
      </Box>
      <ul
        style={{
          width: "100%",
          margin: 0,
          padding: 0,
          paddingLeft: 0,
          listStyleType: "none",
        }}
      >
        {children}
      </ul>
    </Box>
  )
}
