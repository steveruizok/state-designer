// @jsx jsx
import * as React from "react"
import { jsx, Box, Flex, Grid, IconButton } from "theme-ui"
import { getFlatStates } from "../utils"
import * as Motion from "framer-motion"
import * as Icons from "react-feather"
import { MoreHorizontal, Minimize, Compass, RefreshCw } from "react-feather"
import { Highlights } from "../states/highlights"
import { ui } from "../states/ui"
import { presentation } from "../states/presentation"
import { useStateDesigner } from "@state-designer/react"
import { useGesture } from "react-use-gesture"
import {
  motion,
  useMotionValue,
  useAnimation,
  useGestures,
} from "framer-motion"
import IconSelect from "./icon-select"
import StateNode from "./chart/state-node"
import * as _ from "lodash"
import * as ThemeUI from "theme-ui"
import {
  withLive,
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview,
} from "react-live"

const Main: React.FC = ({}) => {
  const local = useStateDesigner(ui)
  const pres = useStateDesigner(presentation)

  return local.whenIn({
    "ready.state": <ChartView />,
    "ready.presentation": (
      <LiveProvider
        code={pres.data.dirty}
        scope={{
          ...ThemeUI,
          ...Motion,
          _,
          Icons,
          useStateDesigner,
          state: local.data.captive,
        }}
      >
        <Flex
          sx={{
            p: 2,
            gridArea: "main",
            height: "100%",
            width: "100%",
            gridTemplateRows: "1fr",
            fontSize: 16,
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LivePreview />
          <LiveError
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              m: 0,
              padding: 2,
              width: "100%",
              fontSize: 1,
              height: "min-content",
              fontFamily: "monospace",
              bg: "scrim",
            }}
          />
        </Flex>
      </LiveProvider>
    ),
    default: <div>...</div>,
  })
}

export default Main

function ChartView() {
  const local = useStateDesigner(ui)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  const states = getFlatStates(captive.stateTree)

  const zoomed = states.find((node) => node.path === local.data.zoomed)

  const mvCanvasX = useMotionValue(0)
  const mvCanvasY = useMotionValue(0)
  const mvScale = useMotionValue(1)

  const animation = useAnimation()

  const bind = useGesture({
    onWheel: ({ vxvy: [, vy] }) => {
      const scale = mvScale.get()
      mvScale.set(Math.max(0.5, Math.min(2, scale + vy / 60)))
    },
  })

  function resetScrollPosition() {
    animation.start({ x: 0, y: 0, scale: 1 })
  }

  return (
    <motion.div
      {...bind}
      onMouseEnter={() => Highlights.send("CLEARED_HIGHLIGHT")}
      sx={{
        gridArea: "main",
        overflow: "hidden",
        position: "relative",
        cursor: "grab",
        bg: "canvas",
        "& > *[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover > *[data-hidey='true']": {
          visibility: "visible",
        },
      }}
      whileTap={{
        userSelect: "none",
      }}
      onPan={(e, info) => {
        mvCanvasX.set(mvCanvasX.get() + info.delta.x)
        mvCanvasY.set(mvCanvasY.get() + info.delta.y)
      }}
      onDoubleClick={() => resetScrollPosition()}
      {...bind()}
    >
      <motion.div
        style={{
          x: mvCanvasX,
          y: mvCanvasY,
          scale: mvScale,
          height: "100%",
          width: "100%",
          minWidth: 400,
          display: "flex",
          placeContent: "center",
          placeItems: "center",
        }}
        animate={animation}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <StateNode node={zoomed || captive.stateTree} />
      </motion.div>
      {zoomed && zoomed !== captive.stateTree && (
        <IconButton
          onClick={() => ui.send("ZOOMED_OUT")}
          sx={{ position: "absolute", top: 0, left: 0 }}
        >
          <Minimize />
        </IconButton>
      )}
      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", top: 0, right: 0 }}
        title="Reset Canvas"
        onClick={() => resetScrollPosition()}
      >
        <Compass />
      </IconButton>
      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", bottom: 0, right: 0 }}
        title="Reset State"
        onClick={() => captive.reset()}
      >
        <RefreshCw />
      </IconButton>
    </motion.div>
  )
}
