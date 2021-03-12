import * as React from "react"
import { Heading, Box } from "theme-ui"

export const PanelHeading: React.FC<{
  title: string
  as?: React.ElementType
}> = ({ title, as = "h3", children }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns: "38% 1fr",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        height: 52,
        bg: "muted",
        borderTop: "1px solid",
        borderColor: "rgba(69, 68, 78, 1.000)",
        "&:first-of-type": {
          borderColor: "transparent",
        },
      }}
    >
      <Heading as={as}>{title}</Heading>
      {children}
    </Box>
  )
}
