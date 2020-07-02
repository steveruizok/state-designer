// @jsx jsx
import * as React from "react"
import { jsx, Box, IconButton } from "theme-ui"
import { RefreshCw, Minimize } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import { useMotionValue } from "framer-motion"
import { Project, JsxEditorState, UI } from "../../states"
import Preview from "../preview"
import Chart from "../chart"

const Main: React.FC = () => {
  const local = useStateDesigner(Project)
  const ui = useStateDesigner(UI)
  const jsxEditor = useStateDesigner(JsxEditorState)

  return (
    <Box
      sx={{
        gridArea: "main",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& *[data-hidey='true']": {
            visibility: "hidden",
          },
          "&:hover:not([disabled]) *[data-hidey='true']": {
            visibility: "visible",
          },
        }}
      >
        <Chart state={local.data.captive} zoomedPath={ui.data.zoomedPath} />
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& *[data-hidey='true']": {
            visibility: "hidden",
          },
          "&:hover:not([disabled]) *[data-hidey='true']": {
            visibility: "visible",
          },
        }}
      >
        <Preview
          code={jsxEditor.data.dirty}
          statics={local.data.statics}
          state={local.data.captive}
          theme={local.data.theme}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          width: "100%",
          height: "100%",
        }}
        data-hidey-draggy="true"
      />
      {local.log.length > 0 && (
        <IconButton
          data-hidey="true"
          sx={{ position: "absolute", bottom: 0, right: 0 }}
          title="Reset State"
          onClick={() => local.data.captive?.reset()}
        >
          <RefreshCw />
        </IconButton>
      )}
      {ui.data.zoomedPath &&
        ui.data.zoomedPath !== local.data.captive.stateTree.path && (
          <IconButton
            onClick={() => ui.send("ZOOMED_OUT")}
            sx={{ position: "absolute", top: 0, left: 0 }}
          >
            <Minimize />
          </IconButton>
        )}
    </Box>
  )
}

export default Main
