import * as React from "react"
import Bricks from "../images/bricks.svg"

type Props = {
  x: number
} & React.HTMLProps<HTMLDivElement>

const BrickColumn: React.FC<Props> = ({ x, ...rest }) => {
  return (
    <div
      style={{
        gridColumnStart: x,
        gridColumnEnd: x + 1,
        gridRowStart: 1,
        gridRowEnd: 21,
        backgroundColor: `var(--tetris-mdark)`,
        backgroundImage: `url(${Bricks})`,
        backgroundPosition: "0px -4px",
        backgroundSize: "24px 18px",
        borderLeft: `3px solid var(--tetris-light)`,
        borderRight: `3px solid var(--tetris-light)`,
        ...rest.style,
      }}
      {...rest}
    ></div>
  )
}

export default BrickColumn
