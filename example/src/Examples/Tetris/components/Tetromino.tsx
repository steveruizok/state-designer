import * as React from "react"
import { FallingTetromino } from "../game/types"
import TetrominoBlock from "./TetrominoBlock"

type Props = FallingTetromino & React.HTMLProps<HTMLDivElement>

const Tetromino: React.FC<Props> = ({ origin, type, tetromino }) => {
  return (
    <>
      {tetromino.map((row, y) =>
        row.map((cell, x) => {
          if (!cell || origin.y - 1 + y < 0) return null

          return (
            <TetrominoBlock
              key={`${origin.x - 2 + x}_${origin.y - 1 + y}`}
              x={origin.x - 2 + x + 1}
              y={origin.y - 1 + y}
              type={type}
            />
          )
        })
      )}
    </>
  )
}

export default Tetromino
