// @jsx jsx
import * as React from "react"
import { IconButton } from "theme-ui"
import { Compass } from "react-feather"
import {
  motion,
  useMotionValue,
  useAnimation,
  MotionProps,
  MotionValue,
} from "framer-motion"
import { usePreventZooming, useScaleZooming } from "../../hooks/gestures"

type Props = React.HTMLProps<HTMLDivElement> &
  MotionProps & {
    mvScale?: MotionValue<number>
    minZoom?: number
    showResetView?: boolean
    maxZoom?: number
    fixed?: React.ReactNode
  }

const Canvas = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      fixed,
      mvScale,
      showResetView = true,
      minZoom = 0.25,
      maxZoom = 2.5,
      ...rest
    },
    ref
  ) => {
    const mvX = useMotionValue(0)
    const mvY = useMotionValue(0)
    const animation = useAnimation()

    usePreventZooming(ref as any)

    const [bind, scale] = useScaleZooming(true, true, 0.25, 3, mvScale)

    function resetScrollPosition() {
      animation.start({ x: 0, y: 0, scale: 1 })
    }

    return (
      <motion.div
        ref={ref}
        sx={{
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
          sx={{ position: "absolute", bottom: 0, right: 0 }}
          title="Reset Canvas"
          onClick={() => resetScrollPosition()}
        >
          <Compass />
        </IconButton>
      </motion.div>
    )
  }
)

export default Canvas
