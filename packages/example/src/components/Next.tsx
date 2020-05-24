import * as React from "react"
import { useStateDesign } from "@state-designer/react"
import game from "../game"

import Container from "./Matrix/Container"
import NextPiece from "./Matrix/NextPiece"

const Next: React.FC<{}> = () => {
  const { data } = useStateDesign(game)
  const { next } = data

  return (
    <div>
      {next.map((tetrominoType, i) => (
        <Container key={i} rows={4} columns={4}>
          <NextPiece
            type={tetrominoType}
            orientation={0}
            origin={{ x: 2, y: 1 }}
          />
        </Container>
      ))}
    </div>
  )
}

export default Next
