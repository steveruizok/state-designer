import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import game from "../game"

import Container from "./Matrix/Container"
import FallingPiece from "./Matrix/FallingPiece"
import GhostPiece from "./Matrix/GhostPiece"
import Cell from "./Matrix/Cell"

const Playfield: React.FC<{}> = () => {
  const { data } = useStateDesigner(game)
  const { matrix, falling, ghost } = data

  return (
    <Container rows={20} columns={10}>
      {matrix
        .slice(-20)
        .map((row, y) =>
          row.map((cell, x) => (
            <Cell key={y * 10 + x} x={x} y={y} cell={cell} />
          ))
        )}
      <GhostPiece {...ghost} />
      <FallingPiece {...falling} />
    </Container>
  )
}

export default Playfield
