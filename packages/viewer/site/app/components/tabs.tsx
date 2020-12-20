// @jsx jsx
import * as React from "react"
import { Grid, Button, jsx } from "theme-ui"
import { Circle } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import {
  Project,
  StateEditorState,
  JsxEditorState,
  StaticsEditorState,
} from "../states"

const Save: React.FC = ({}) => {
  const local = useStateDesigner(Project)
  const local_state = useStateDesigner(StateEditorState)
  const local_jsx = useStateDesigner(JsxEditorState)
  const local_static = useStateDesigner(StaticsEditorState)

  return (
    <Grid
      gap={0}
      sx={{
        position: "relative",
        gridArea: "tabs",
        bg: "muted",
        p: 0,
        gap: 0,
        width: "100%",
        gridAutoFlow: "column",
        gridAutoColumns: "1fr",
        borderLeft: "outline",
        borderBottom: "outline",
        borderColor: "border",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("tabs.state")}
        onClick={() => local.send("TABBED_TO_STATE")}
      >
        <Circle
          size={9}
          strokeWidth={local_state.isInAny("idle", "pristine") ? 0 : 4}
        />{" "}
        State
      </Button>
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("tabs.jsx")}
        onClick={() => local.send("TABBED_TO_JSX")}
      >
        <Circle
          size={9}
          strokeWidth={local_jsx.isInAny("idle", "pristine") ? 0 : 4}
        />{" "}
        View
      </Button>
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("tabs.static")}
        onClick={() => local.send("TABBED_TO_STATIC")}
      >
        <Circle
          size={9}
          strokeWidth={local_static.isInAny("idle", "pristine") ? 0 : 4}
        />{" "}
        Static
      </Button>
    </Grid>
  )
}
export default Save
