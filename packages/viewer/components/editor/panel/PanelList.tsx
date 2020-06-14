import * as React from "react"
import { Heading, Box } from "theme-ui"

export const PanelList: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <Box mb={3}>
      <Box
        sx={{
          px: 2,
          py: 3,
          bg: "muted",
          borderTop: "1px solid",
          borderColor: "active",
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
