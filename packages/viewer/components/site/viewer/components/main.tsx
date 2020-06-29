// @jsx jsx
import * as React from "react"
import { jsx, Box, Flex, IconButton } from "theme-ui"
import { getFlatStates } from "../utils"
import * as Motion from "framer-motion"
import * as Icons from "react-feather"
import { Minimize, Compass, RefreshCw } from "react-feather"
import { ui } from "../states/ui"
import { presentation } from "../states/presentation"
import { useStateDesigner } from "@state-designer/react"
import { usePinch, useGesture } from "react-use-gesture"
import {
  motion,
  useMotionValue,
  useAnimation,
  MotionProps,
  MotionValue,
} from "framer-motion"
import StateNode from "./chart/state-node"
import _ from "lodash"
import * as ThemeUI from "theme-ui"
import * as Components from "@theme-ui/components"
import { LiveProvider, LiveError, LivePreview } from "react-live"

const WithMotionComponents = Object.fromEntries(
  Object.entries(Components).map(([k, v]) => {
    return [k, motion.custom(v as any)]
  })
)

const Main: React.FC = ({}) => {
  const local = useStateDesigner(ui)
  const stateScale = useMotionValue(1)
  const presScale = useMotionValue(1)

  return (
    <Box
      sx={{
        gridArea: "main",
        position: "relative",
        overflow: "hidden",
        "& *[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover:not([disabled]) *[data-hidey='true']": {
          visibility: "visible",
        },
      }}
    >
      {local.whenIn({
        "ready.state": <ChartView mvScale={stateScale} />,
        "ready.presentation": <PresentationView mvScale={presScale} />,
      })}

      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", bottom: 0, right: 0 }}
        title="Reset State"
        onClick={() => ui.data.captive?.reset()}
      >
        <RefreshCw />
      </IconButton>
    </Box>
  )
}

export default Main

function usePreventZooming() {
  const rContainer = React.useRef<HTMLDivElement>()

  // Disable pinch-to-zoom on an element.
  React.useEffect(() => {
    const container = rContainer.current
    if (!container) return

    function preventTouchZooming(e: WheelEvent) {
      if (e.ctrlKey) e.preventDefault()
    }

    container.addEventListener("wheel", preventTouchZooming, {
      passive: false,
    })
    container.addEventListener("touchmove", preventTouchZooming, {
      passive: false,
    })
    return () => {
      container.removeEventListener("wheel", preventTouchZooming)
      container.removeEventListener("touchmove", preventTouchZooming)
    }
  }, [])

  return rContainer
}

function useScaleZooming(
  minZoom: number = 0.25,
  maxZoom: number = 2.5,
  mvScale?: MotionValue<number>
) {
  const localMvScale = useMotionValue(0)

  const bind = useGesture({
    onPinch: ({ delta }) => {
      const mv = mvScale || localMvScale
      const scale = mvScale.get()
      mvScale.set(Math.max(minZoom, Math.min(maxZoom, scale - delta[1] / 60)))
    },
    onWheel: ({ vxvy: [, vy] }) => {
      const mv = mvScale || localMvScale
      const scale = mvScale.get()
      mvScale.set(Math.max(minZoom, Math.min(maxZoom, scale + vy / 30)))
    },
  })

  return [bind, mvScale || localMvScale] as const
}

const ChartView: React.FC<{ mvScale: MotionValue<number> }> = ({ mvScale }) => {
  const local = useStateDesigner(ui)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])
  const states = getFlatStates(captive.stateTree)
  const zoomed = states.find((node) => node.path === local.data.zoomed)

  return (
    <CanvasContainer
      mvScale={mvScale}
      fixed={
        zoomed &&
        zoomed !== captive.stateTree && (
          <IconButton
            onClick={() => ui.send("ZOOMED_OUT")}
            sx={{ position: "absolute", top: 0, left: 0 }}
          >
            <Minimize />
          </IconButton>
        )
      }
    >
      <StateNode node={zoomed || captive.stateTree} />
    </CanvasContainer>
  )
}

const PresentationView: React.FC<{ mvScale: MotionValue<number> }> = ({
  mvScale,
}) => {
  const local = useStateDesigner(ui)
  const pres = useStateDesigner(presentation)
  const animation = useAnimation()

  const rContainer = usePreventZooming()
  const [bind, scale] = useScaleZooming(0.25, 3, mvScale)

  return (
    <LiveProvider
      code={pres.data.dirty}
      scope={{
        ...ThemeUI,
        ...Motion,
        ...WithMotionComponents,
        _,
        Icons,
        useStateDesigner,
        state: local.data.captive,
      }}
    >
      <motion.div
        ref={rContainer}
        style={{ width: "100%", height: "100%" }}
        {...bind()}
      >
        <motion.div
          style={{ scale }}
          animate={animation}
          sx={{
            p: 2,
            display: "flex",
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
        </motion.div>
        <IconButton
          data-hidey="true"
          sx={{ position: "absolute", top: 0, right: 0 }}
          title="Reset Canvas"
          onClick={() => animation.start({ scale: 1 })}
        >
          <Compass />
        </IconButton>
      </motion.div>
    </LiveProvider>
  )
}

const CanvasContainer: React.FC<
  React.HTMLProps<HTMLDivElement> &
    MotionProps & {
      mvScale?: MotionValue<number>
      minZoom?: number
      showResetView?: boolean
      maxZoom?: number
      fixed?: React.ReactNode
    }
> = ({
  children,
  fixed,
  mvScale,
  showResetView = true,
  minZoom = 0.25,
  maxZoom = 2.5,
  ...rest
}) => {
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)
  const animation = useAnimation()

  const rContainer = usePreventZooming()
  const [bind, scale] = useScaleZooming(0.25, 3, mvScale)

  function resetScrollPosition() {
    animation.start({ x: 0, y: 0, scale: 1 })
  }

  return (
    <motion.div
      ref={rContainer}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        cursor: "grab",
        userSelect: "none",
      }}
      whileTap={{
        userSelect: "none",
      }}
      onPan={(e, info) => {
        mvX.set(mvX.get() + info.delta.x)
        mvY.set(mvY.get() + info.delta.y)
      }}
      onDoubleClick={() => resetScrollPosition()}
      {...bind()}
    >
      <motion.div
        style={{
          x: mvX,
          y: mvY,
          scale,
          height: "100%",
          width: "100%",
          display: "flex",
          placeContent: "center",
          placeItems: "center",
          position: "relative",
        }}
        animate={animation}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
      {fixed}
      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", top: 0, right: 0 }}
        title="Reset Canvas"
        onClick={() => resetScrollPosition()}
      >
        <Compass />
      </IconButton>
    </motion.div>
  )
}
