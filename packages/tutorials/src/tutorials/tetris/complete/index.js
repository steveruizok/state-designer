import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Tetris, VStack } from "components"
import { colors, tetrominos } from "./static"
import game from "./game"
import useInputs from "./input"

const {
  Layout,
  PlayField,
  NextField,
  Layer,
  MatrixTetromino,
  Piece,
  GhostPiece,
  Stats,
  Label,
  Button,
} = Tetris

export default function () {
  const state = useStateDesigner(game)
  useInputs()

  const { falling, ghost, score, level, lines } = state.data

  return (
    <Layout>
      <PlayField>
        <Layer>
          {state.data.matrix
            .slice(-20)
            .map((row) =>
              row.map((type, i) => (
                <MatrixTetromino key={i} color={colors[type]} />
              ))
            )}
        </Layer>
        <Layer>
          <Piece
            tetrominos={tetrominos[falling.type][falling.orientation]}
            color={colors[falling.type]}
            x={falling.origin.x}
            y={falling.origin.y - 20}
          />
          <GhostPiece
            tetrominos={tetrominos[ghost.type][ghost.orientation]}
            origin={ghost.origin}
            x={ghost.origin.x}
            y={ghost.origin.y - 20}
          />
        </Layer>
      </PlayField>
      <NextField>
        {state.data.next.map((type, i) => {
          return (
            <Piece
              key={i}
              tetrominos={tetrominos[type][0]}
              color={colors[type]}
              x={2}
              y={i * 3}
            />
          )
        })}
      </NextField>
      <VStack>
        <Stats>
          <Label>Score</Label> {score}
          <Label>Level</Label> {level}
          <Label>Lines</Label> {lines}
        </Stats>
        <Button
          highlight={!state.isIn("playing")}
          onClick={() => state.send("STARTED")}
        >
          {state.whenIn({
            playing: "Pause",
            paused: "Resume",
            start: "Play",
            gameover: "Play Again",
          })}
        </Button>
      </VStack>
    </Layout>
  )
}
