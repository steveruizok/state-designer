import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Tetris as T } from "components"
import { colors, tetrominos } from "./static"
import game from "./game"
import useKeyboardInputs from "./input"

export default function () {
  const state = useStateDesigner(game)

  useKeyboardInputs()

  const { falling, ghost, score, level, lines } = state.data

  return (
    <T.Layout>
      <T.PlayField>
        <T.Layer>
          {state.data.matrix
            .slice(-20)
            .map((row, y) =>
              row.map((type, x) => (
                <T.Tetromino
                  key={y * 10 + x}
                  color={colors[type]}
                  x={x}
                  y={y}
                />
              ))
            )}
        </T.Layer>
        <T.Layer>
          <T.Piece
            tetrominos={tetrominos[falling.type][falling.orientation]}
            color={colors[falling.type]}
            x={falling.origin.x}
            y={falling.origin.y - 20}
          />
          <T.GhostPiece
            tetrominos={tetrominos[ghost.type][ghost.orientation]}
            origin={ghost.origin}
            x={ghost.origin.x}
            y={ghost.origin.y - 20}
          />
        </T.Layer>
      </T.PlayField>
      <T.NextField>
        {state.data.next.map((type, i) => {
          return (
            <T.Piece
              key={i}
              tetrominos={tetrominos[type][0]}
              color={colors[type]}
              x={2}
              y={i * 3}
            />
          )
        })}
      </T.NextField>
      <T.Stats>
        <T.Label>Score</T.Label> {score}
        <T.Label>Level</T.Label> {level}
        <T.Label>Lines</T.Label> {lines}
      </T.Stats>
      <T.Button
        highlight={!state.isIn("playing")}
        onClick={() => state.send("STARTED")}
      >
        {state.whenIn({
          playing: "Pause",
          paused: "Resume",
          start: "Play",
          gameover: "Play Again",
        })}
      </T.Button>
    </T.Layout>
  )
}
