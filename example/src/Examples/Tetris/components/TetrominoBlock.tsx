import * as React from "react"
import { TetrominoType } from "../game/types"
import blocks from "./blocks"

type Props = {
  type: TetrominoType
  x: number
  y: number
} & React.HTMLProps<HTMLDivElement>

const TetrominoBlock: React.FC<Props> = ({ x, y, type, ...rest }) => {
  const Block = blocks[type]

  return (
    <div
      style={{
        height: 24,
        width: 24,
        gridColumnStart: x + 1,
        gridColumnEnd: x + 2,
        gridRowStart: y + 1,
        gridRowEnd: y + 2,
        ...rest.style,
      }}
      {...rest}
    >
      <Block />
    </div>
  )
}

export default TetrominoBlock
