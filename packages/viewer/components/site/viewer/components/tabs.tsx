// @jsx jsx
import * as React from "react"
import { Box, Text, IconButton, Grid, Button, jsx } from "theme-ui"
import { Circle, Save as SaveIcon, RefreshCcw, FilePlus } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import { editor } from "../states/editor"
import { ui } from "../states/ui"
import { presentation } from "../states/presentation"

const Save: React.FC = ({}) => {
  const local_e = useStateDesigner(editor)
  const local_p = useStateDesigner(presentation)
  const local = useStateDesigner(ui)

  return (
    <Grid
      gap={0}
      sx={{
        position: "relative",
        gridArea: "tabs",
        bg: "muted",
        p: 0,
        width: "100%",
        gridTemplateColumns: "1fr 1fr",
        borderLeft: "outline",
        borderBottom: "outline",
        borderColor: "border",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("state")}
        onClick={() => local.send("TABBED_TO_STATE")}
      >
        <Circle
          size={9}
          strokeWidth={local_e.isInAny("idle", "same") ? 0 : 4}
        />{" "}
        State
      </Button>
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("presentation")}
        onClick={() => local.send("TABBED_TO_PRESENTATION")}
      >
        <Circle
          size={9}
          strokeWidth={local_p.isInAny("idle", "same") ? 0 : 4}
        />{" "}
        Presentation
      </Button>
    </Grid>
  )
}
export default Save
