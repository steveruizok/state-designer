import * as React from "react"
import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue } from "framer-motion"
import move from "array-move"

type Props = {
  setPosition: any
  moveItem: any
  index: number
}

export const Item: React.FC<Props> = ({
  children,
  setPosition,
  moveItem,
  index
}) => {
  const [isDragging, setDragging] = useState(false)
  const ref = React.useRef<HTMLLIElement>(null)
  const dragOriginY = useMotionValue(0)

  useEffect(() => {
    if (ref.current === null) return

    setPosition(index, {
      height: ref.current.offsetHeight,
      top: ref.current.offsetTop
    })
  })

  return (
    <motion.li
      ref={ref}
      initial={false}
      animate={isDragging ? onTop : flat}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.12 }}
      drag="y"
      dragOriginY={dragOriginY}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      onDrag={(e, { point }) => moveItem(index, point.y)}
      positionTransition={({ delta }) => {
        if (isDragging) {
          dragOriginY.set(dragOriginY.get() + delta.y)
        }
        return !isDragging
      }}
    >
      {children}
    </motion.li>
  )
}

// Spring configs
const onTop = { zIndex: 1 }
const flat = {
  zIndex: 0,
  transition: { delay: 0.3 }
}
