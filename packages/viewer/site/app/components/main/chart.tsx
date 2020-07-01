// @jsx jsx
import * as React from "react"
import { jsx, IconButton } from "theme-ui"
import { getFlatStates } from "../../utils"
import { useGesture } from "react-use-gesture"
import { Minimize, Compass } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import {
  motion,
  useMotionValue,
  useAnimation,
  MotionProps,
  MotionValue,
} from "framer-motion"
import StateNode from "../chart/state-node"
import { Project, UI, JsxEditorState } from "../../states"

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
  wheel: boolean = true,
  pinch: boolean = true,
  minZoom: number = 0.25,
  maxZoom: number = 2.5,
  mvScale?: MotionValue<number>
) {
  const localMvScale = useMotionValue(0)

  const bind = useGesture({
    onPinch: ({ delta }) => {
      const mv = mvScale || localMvScale
      const scale = mv.get()
      pinch &&
        mv.set(Math.max(minZoom, Math.min(maxZoom, scale - delta[1] / 60)))
    },
    onWheel: ({ vxvy: [, vy] }) => {
      const mv = mvScale || localMvScale
      const scale = mv.get()
      wheel && mv.set(Math.max(minZoom, Math.min(maxZoom, scale + vy / 30)))
    },
  })

  return [bind, mvScale || localMvScale] as const
}

const Chart: React.FC<{ mvScale: MotionValue<number> }> = ({ mvScale }) => {
  const { data } = useStateDesigner(Project)
  const ui = useStateDesigner(UI)

  const captive = useStateDesigner(data.captive, [data.captive])

  const states = getFlatStates(captive.stateTree)
  const zoomed = states.find((node) => node.path === ui.data.zoomedPath)

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
  const [bind, scale] = useScaleZooming(true, true, 0.25, 3, mvScale)

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

export default Chart
