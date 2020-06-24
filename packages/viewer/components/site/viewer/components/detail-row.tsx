import * as React from "react"
import { Grid } from "theme-ui"
import Data from "./data"
import Values from "./values"

const Detail: React.FC = (props) => {
  return (
    <Grid
      sx={{
        overflow: "hidden",
        position: "relative",
        gridArea: "detail",
        gridAutoFlow: "column",
        gridTemplateColumns: "1fr 1fr",
        borderTop: "outline",
        borderColor: "border",
        gap: 0,
      }}
    >
      <Data />
      <Values />
    </Grid>
  )
}
export default Detail
