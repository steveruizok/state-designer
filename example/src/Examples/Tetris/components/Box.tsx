import * as React from "react"
type Props = {
  x: number
  y: number
  width: number
  height: number
  fill: string
} & React.HTMLProps<HTMLDivElement>

const Box: React.FC<Props> = ({ x, y, width, height, fill, ...rest }) => {
  return (
    <div
      style={{
        backgroundColor: fill,
        gridColumn: `${x} / span ${width}`,
        gridRow: `${y} / span ${height}`,
        color: `var(--tetris-dark)`,
        padding: 3,
        ...rest.style,
      }}
      {...rest}
    ></div>
  )
}

export default Box
