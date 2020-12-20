import * as React from "react"
import { motion, useAnimation, useMotionValue } from "framer-motion"

// This component is bad. Replace all of these with some other author's pane component.

const DragHandleVertical: React.FC<{
  initial: number
  initialOffset?: number
  onChange: (offset: number) => void
  max?: number
  min?: number
  align?: "top" | "bottom"
  gridArea?: string
}> = ({
  initial,
  initialOffset = 0,
  min = 0,
  max = 0,
  align = "top",
  gridArea,
  onChange,
  children,
}) => {
  const y = useMotionValue(initialOffset)
  const animation = useAnimation()
  const rState = React.useRef<"max" | "moved" | "initial">("initial")

  const resetPosition = React.useCallback(() => {
    const state = rState.current

    switch (state) {
      case "initial":
        animation.start({ y: align === "top" ? max : -max })
        rState.current = "max"
        break
      default:
        animation.start({ y: 0 })
        rState.current = "initial"
        break
    }
  }, [])

  React.useEffect(() => y.onChange(onChange), [onChange])

  return (
    <motion.div
      style={{
        y,
        position: "absolute",
        ...(align === "top" ? { top: initial - 2 } : { bottom: initial - 2 }),
        minHeight: 4,
        width: "100%",
        cursor: "row-resize",
        border: "none",
        background: "none",
        gridArea,
      }}
      animate={animation}
      drag="y"
      dragMomentum={false}
      dragConstraints={{
        top: align === "top" ? -(initial - min) : -max, // Todo: Test
        bottom: align === "bottom" ? initial - min : initial - min,
      }}
      onDragStart={() => {
        rState.current = "moved"
      }}
      onDoubleClick={resetPosition}
    >
      {children}
    </motion.div>
  )
}

export default DragHandleVertical
