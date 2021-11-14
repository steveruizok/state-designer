import * as React from "react"
import { motion, MotionValue, PanInfo } from "framer-motion"

const DragHandleHorizontal: React.FC<{
  initial: number
  motionValue: MotionValue<number>
  max?: number
  min?: number
  align?: "right" | "left"
  gridArea?: string
  onDoubleClick: () => void
  onPan: (e: any, info: PanInfo) => void
}> = ({ gridArea, children, motionValue, onDoubleClick, onPan }) => {
  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        x: motionValue,
        position: "absolute",
        top: 0,
        left: 0,
        width: 4,
        height: "100%",
        cursor: "ew-resize",
        border: "none",
        background: "none",
        gridArea,
        zIndex: 999,
      }}
      drag={"x"}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(e, info) => onPan && onPan(e, info)}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </motion.div>
  )
}

export default DragHandleHorizontal
