import * as React from "react"
import styled from "styled-components"
import { motion, MotionProps } from "framer-motion"

export const Background = styled.div`
  padding: 32px;
  background-color: var(--zh-sisal);
`

export const Screen = styled.div`
  height: 480px;
  width: 640px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(32, 1fr);
  grid-template-rows: repeat(24, 1fr);
  background-color: var(--zh-thunder);
  border: 4px inset var(--zh-zorba);
  border-radius: 8px;
  position: relative;
`

type BoxProps = {
  x: number
  y: number
  width: number
  height: number
}

export const Box = React.forwardRef<
  HTMLDivElement,
  BoxProps & React.HTMLProps<HTMLDivElement>
>(({ x, y, width, height, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      {...rest}
      style={{
        gridColumn: `${x + 1} / span ${width}`,
        gridRow: `${y + 1} / span ${height}`,
        ...rest.style,
      }}
    />
  )
})

export const MotionBox: React.FC<BoxProps & MotionProps> = ({
  x,
  y,
  width,
  height,
  ...rest
}) => {
  return (
    <motion.div
      {...rest}
      style={{
        gridColumn: `${x + 1} / span ${width}`,
        gridRow: `${y + 1} / span ${height}`,
        ...rest.style,
      }}
    />
  )
}
