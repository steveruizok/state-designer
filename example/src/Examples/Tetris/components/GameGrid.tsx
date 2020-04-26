import * as React from "react"
import { Grid } from "../game/types"
import TetrominoBlock from "./TetrominoBlock"

type Props = {
  grid: Grid
} & React.HTMLProps<HTMLDivElement>

const GameGrid: React.FC<Props> = ({ grid, ...rest }) => {
  return (
    <>
      {grid.map((row, y) =>
        row.map(
          (cell, x) =>
            cell !== 0 &&
            y >= 0 && (
              <TetrominoBlock key={`${x}_${y}`} x={x + 1} y={y} type={cell} />
            )
        )
      )}
    </>
  )
}

export default GameGrid
