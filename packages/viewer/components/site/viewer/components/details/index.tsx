import * as React from "react"
import { Grid } from "theme-ui"
import Data from "./data"
import Values from "./values"
import { Project } from "../../states"
import { useStateDesigner } from "@state-designer/react"

const Details: React.FC = (props) => {
  const local = useStateDesigner(Project)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  return (
    <Grid
      sx={{
        overflow: "hidden",
        position: "relative",
        gridArea: "detail",
        gridAutoFlow: "column",
        gridAutoColumns: "1fr",
        borderTop: "outline",
        borderColor: "border",
        gap: 0,
      }}
    >
      <Data data={captive.data} />
      <Values values={captive.values} />
    </Grid>
  )
}
export default Details
