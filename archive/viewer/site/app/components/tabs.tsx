// @jsx jsx
import * as React from "react"
import { Box, Text, IconButton, Grid, Button, jsx } from "theme-ui"
import { Circle, Save as SaveIcon, RefreshCcw, FilePlus } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import {
  Project,
  StateEditorState,
  JsxEditorState,
  ThemeEditorState,
  TestsEditorState,
  StaticsEditorState,
} from "../states"

const Save: React.FC = ({}) => {
  const local = useStateDesigner(Project)
  const local_state = useStateDesigner(StateEditorState)
  const local_jsx = useStateDesigner(JsxEditorState)
  // const local_theme = useStateDesigner(ThemeEditorState)
  const local_static = useStateDesigner(StaticsEditorState)
  const local_tests = useStateDesigner(TestsEditorState)

  return (
    <Grid
      gap={0}
      sx={{
        position: "relative",
        gridArea: "tabs",
        bg: "muted",
        p: 0,
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
      {/* <Button
        variant="tab"
        data-issuppressed={!local.isIn("tabs.theme")}
        onClick={() => local.send("TABBED_TO_THEME")}
      >
        <Circle
          size={9}
          strokeWidth={local_theme.isInAny("idle", "pristine") ? 0 : 4}
        />{" "}
        Theme
      </Button> */}
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
      <Button
        variant="tab"
        data-issuppressed={!local.isIn("tabs.tests")}
        onClick={() => local.send("TABBED_TO_TESTS")}
      >
        <Circle
          size={9}
          strokeWidth={local_tests.isInAny("idle", "pristine") ? 0 : 4}
        />{" "}
        Tests
      </Button>
    </Grid>
  )
}
export default Save
