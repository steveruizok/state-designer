// @jsx jsx
import * as React from "react"
import { jsx, Grid, Box, IconButton, Styled } from "theme-ui"
import { ExternalLink, RefreshCw, Minimize } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"
import { Project, JsxEditorState, UI } from "../../states"
import DragHandle from "../drag-handle"
import Preview from "../preview"
import Chart from "../chart"
import ResetButton from "./reset-button"
import { useMotionValue, PanInfo } from "framer-motion"

const Main: React.FC = () => {
  const local = useStateDesigner(Project)
  const ui = useStateDesigner(UI)
  const jsxEditor = useStateDesigner(JsxEditorState)

  const mvColumWidth = useMotionValue(0)
  const rOffset = React.useRef(0)

  const resetColumns = React.useCallback(() => {
    rOffset.current = 0

    document.documentElement.style.setProperty("--view-column-offset", "0px")
  }, [])

  const handleDragHandleChange = React.useCallback((e: any, info: PanInfo) => {
    const offset = rOffset.current
    const next = info.delta.x + offset
    rOffset.current = next

    document.documentElement.style.setProperty(
      "--view-column-offset",
      -next + "px"
    )
  }, [])

  return (
    <Box
      sx={{
        gridArea: "main",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Grid
        sx={{
          height: "100%",
          position: "relative",
          gridTemplateColumns:
            "auto clamp(10%, 90%, calc(50% + var(--view-column-offset)))",
          gridAutoFlow: "column",
          gap: 0,
        }}
      >
        <ViewWrapper visible={true}>
          <Chart state={local.data.captive} zoomedPath={ui.data.zoomedPath} />
          <Styled.a
            href={`/${local.data.oid}/${local.data.pid}/chart`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton
              data-hidey="true"
              sx={{ position: "absolute", top: 0, right: 0 }}
              title="Reset State"
              onClick={() => local.data.captive?.reset()}
            >
              <ExternalLink />
            </IconButton>
          </Styled.a>
        </ViewWrapper>
        <ViewWrapper visible={true}>
          <DragHandle
            initial={0}
            min={0}
            max={0}
            align={"left"}
            motionValue={mvColumWidth}
            onPan={handleDragHandleChange}
            onDoubleClick={resetColumns}
          >
            <Box sx={{ height: "100%", width: 2, bg: "border" }} />
          </DragHandle>
          <Preview
            code={jsxEditor.data.dirty}
            statics={local.data.statics}
            state={local.data.captive}
            theme={local.data.theme}
          />
          <Styled.a
            href={`/${local.data.oid}/${local.data.pid}/preview`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton
              data-hidey="true"
              sx={{ position: "absolute", top: 0, right: 0 }}
              title="Reset State"
              onClick={() => local.data.captive?.reset()}
            >
              <ExternalLink />
            </IconButton>
          </Styled.a>
          <ResetButton state={local.data.captive} />
        </ViewWrapper>
      </Grid>
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

const ViewWrapper: React.FC<{ visible: boolean }> = ({ visible, ...rest }) => {
  return (
    <Box
      sx={{
        m: 0,
        p: 2,
        height: "100%",
        position: "relative",
        visibility: visible ? "visible" : "hidden",
        "& *[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover:not([disabled]) *[data-hidey='true']": {
          visibility: "visible",
        },
      }}
      {...rest}
    />
  )
}
