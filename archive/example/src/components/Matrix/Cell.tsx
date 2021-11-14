import * as React from "react"

import * as Tetris from "../../game/types"
import * as Static from "../../game/static"

type CellProps = {
  x: number
  y: number
  cell: Tetris.Cell | "ghost"
}

const Cell: React.FC<CellProps> = ({ x, y, cell }) => (
  <div
    style={{
      gridColumn: x + 1,
      gridRow: y + 1,
      backgroundImage: `url(images/${cell}.svg)`,
      backgroundSize: "100%",
      backgroundColor:
        cell === "ghost" ? "#ccc" : cell ? Static.colors[cell] : "transparent",
    }}
  />
)

export default Cell
