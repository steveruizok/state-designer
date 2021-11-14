import * as React from "react"

import * as Tetris from "../../game/types"
import * as Static from "../../game/static"

import Cell from "./Cell"

const FallingPiece: React.FC<Tetris.Piece> = ({
  type,
  orientation,
  origin,
}) => {
  const tetromino = Static.tetrominos[type][orientation]

  return (
    <>
      {tetromino
        .filter((point) => origin.y + point.y - 20 >= 0)
        .map((point, i) => {
          return (
            <Cell
              key={i}
              x={origin.x + point.x}
              y={origin.y + point.y - 20}
              cell={type}
            />
          )
        })}
    </>
  )
}

export default FallingPiece
