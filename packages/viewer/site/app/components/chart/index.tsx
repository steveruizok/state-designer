// @jsx jsx
import * as React from "react"
import { jsx, IconButton } from "theme-ui"
import { getFlatStates } from "../../utils"
import { throttle } from "lodash"
import { Compass } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"
import {
  motion,
  MotionValue,
  useAnimation,
  useMotionValue,
} from "framer-motion"
import StateNode from "./state-node"
import useMotionResizeObserver from "use-motion-resize-observer"
import { usePreventZooming, useScaleZooming } from "../../hooks/gestures"

const Chart: React.FC<{
  state: S.DesignedState<any, any>
  zoomedPath: string
}> = ({ state, zoomedPath }) => {
  const captive = useStateDesigner(state, [state])

  const { ref: rCanvas, width: mvCanvasWidth } = useMotionResizeObserver()
  const { ref: rStateNode, width: mvStateNodeWidth } = useMotionResizeObserver()

  const rAutoScale = React.useRef(1)

  const mvScale = useMotionValue(1)
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)

  const animation = useAnimation()

  const [bind, scale] = useScaleZooming(true, true, 0.25, 3, mvScale)

  // Centers and re-scales canvas
  const resetView = React.useCallback(
    throttle(() => {
      const stateNode = rStateNode.current
      if (!stateNode) return

      const nodeWidth = mvStateNodeWidth.get()
      const canvasWidth = mvCanvasWidth.get()

      let scale = 1

      if (nodeWidth > canvasWidth) {
        scale = (canvasWidth - 16) / nodeWidth
      }

      rAutoScale.current = scale
      animation.start({ x: 0, y: 0, scale })
    }, 60),
    []
  )

  const resize = React.useCallback(
    throttle(() => {
      console.log("resizing")
      const nodeWidth = mvStateNodeWidth.get()
      const canvasWidth = mvCanvasWidth.get()

      if (mvScale.get() !== rAutoScale.current) return

      let scale = 1

      if (nodeWidth > canvasWidth) {
        scale = (canvasWidth - 16) / nodeWidth
      }

      if (scale === mvScale.get()) return

      rAutoScale.current = scale
      mvScale.set(scale)
    }, 32),
    []
  )

  usePreventZooming(rCanvas as any)

  // Resize statenode on mount
  React.useEffect(() => {
    const stateNode = rStateNode.current
    if (!stateNode) return

    const nodeWidth = mvStateNodeWidth.get()
    const canvasWidth = mvCanvasWidth.get()

    if (nodeWidth > canvasWidth) {
      let scale = (canvasWidth - 16) / nodeWidth
      rAutoScale.current = scale
      mvScale.set(scale)
    }

    // Resize on canvas pane resize
    return mvCanvasWidth.onChange(resize)
  }, [zoomedPath])

  // Zoomed states

  const states = getFlatStates(captive.stateTree)

  const zoomed = React.useMemo(() => {
    return states.find((node) => node.path === zoomedPath)
  }, [zoomedPath])

  return (
    <motion.div
      ref={rCanvas as any}
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
      onDoubleClick={() => resetView()}
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
        <StateNode ref={rStateNode as any} node={zoomed || captive.stateTree} />
      </motion.div>
      <IconButton
        data-hidey="true"
        sx={{ position: "absolute", bottom: 0, right: 0 }}
        title="Reset Canvas"
        onClick={() => resetView()}
      >
        <Compass />
      </IconButton>
    </motion.div>
  )
}

export default React.memo(Chart)
