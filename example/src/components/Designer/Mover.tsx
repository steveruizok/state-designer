import React from "react"
import { motion } from "framer-motion"

export interface Props {}

export const Mover: React.FC<Props> = ({ children }) => {
  return (
    <motion.div
      positionTransition={{ duration: 0.2 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  )
}
