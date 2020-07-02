import * as React from "react"
import { motion, useAnimation, useTransform, MotionValue } from "framer-motion"

const DragHandleHorizontal: React.FC<{
  initial: number
  motionValue: MotionValue<number>
  max?: number
  min?: number
  align?: "right" | "left"
  gridArea?: string
  onDragStart?: () => void
  onDragEnd?: () => void
}> = ({
  initial,
  min = 0,
  max = 0,
  align = "left",
  gridArea,
  children,
  motionValue,
  onDragStart,
  onDragEnd,
}) => {
  const animation = useAnimation()
  const rState = React.useRef<"max" | "moved" | "initial">("initial")

  const mvCursor = useTransform(motionValue, (v) => {
    if (align === "left") {
      return v >= max
        ? "w-resize"
        : v <= -(initial - min)
        ? "e-resize"
        : "ew-resize"
    } else {
      return v >= initial - min
        ? "w-resize"
        : v <= -max
        ? "e-resize"
        : "ew-resize"
    }
  })

  const resetPosition = React.useCallback(() => {
    const state = rState.current

    switch (state) {
      case "initial":
        animation.start({ x: align === "left" ? max : -max })
        rState.current = "max"
        break
      default:
        animation.start({ x: 0 })
        rState.current = "initial"
        break
    }
  }, [])

  return (
    <motion.div
      style={{
        x: motionValue,
        position: "absolute",
        top: 0,
        ...(align === "right" ? { right: initial - 3 } : { left: initial - 3 }),
        width: 4,
        height: "100%",
        cursor: mvCursor,
        border: "none",
        background: "none",
        gridArea,
      }}
      animate={animation}
      drag="x"
      dragMomentum={false}
      onDragStart={() => (rState.current = "moved")}
      dragConstraints={{
        left: align === "left" ? -(initial - min) : -max,
        right: align === "left" ? max : initial - min,
      }}
      onDoubleClick={resetPosition}
      onTapStart={() => onDragStart && onDragStart()}
      onTap={() => onDragEnd && onDragEnd()}
    >
      {children}
    </motion.div>
  )
}

export default DragHandleHorizontal
