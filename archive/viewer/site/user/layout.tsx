import * as React from "react"
import { Grid } from "theme-ui"

const Layout: React.FC = ({ children }) => {
  return (
    <Grid
      sx={{
        position: [null, "absolute"],
        border: "outline",
        borderColor: "border",
        background: "background",
        gridTemplateColumns: "1fr",
        gridTemplateRows: [`40px`, `40px 1fr`],
        gridAutoRows: "auto",
        gridTemplateAreas: [
          `
        "title"
        "page"
        `,
          `
          "title"
          "page"
          `,
        ],
        top: 0,
        left: 0,
        height: [null, "100vh"],
        width: [null, "100vw"],
        overflow: [null, "hidden"],
        overscrollBehavior: "none",
        m: 0,
        p: 0,
        gap: 0,
        color: "text",
        bg: "background",
      }}
    >
      {children}
    </Grid>
  )
}

export default Layout
