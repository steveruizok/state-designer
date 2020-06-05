import React from "react"
import { colors, tetrominos } from "./static"
import { useKeyboardInputs } from "utils"
import { Tetris as T } from "components"

export default function () {
  useKeyboardInputs({
    onKeyDown: {},
    onKeyUp: {},
  })

  return (
    <T.Layout>
      <T.PlayField>
        <T.Layer>
          <T.Cell color={colors["O"]} x={7} y={18} />
          <T.Cell color={colors["I"]} x={8} y={18} />
          <T.Cell color={colors["S"]} x={9} y={18} />
          <T.Cell color={colors["Z"]} x={6} y={19} />
          <T.Cell color={colors["L"]} x={7} y={19} />
          <T.Cell color={colors["J"]} x={8} y={19} />
          <T.Cell color={colors["T"]} x={9} y={19} />
        </T.Layer>
        <T.Layer>
          <T.Piece
            tetrominos={tetrominos["Z"][0]}
            color={colors["Z"]}
            x={2}
            y={4}
          />
          <T.GhostPiece tetrominos={tetrominos["Z"][0]} x={2} y={18} />
        </T.Layer>
      </T.PlayField>
      <T.NextField>
        <T.Piece
          tetrominos={tetrominos["T"][0]}
          color={colors["T"]}
          x={0}
          y={0}
        />
      </T.NextField>
      <T.Stats>
        <T.Label>Score</T.Label> {0}
        <T.Label>Level</T.Label> {0}
        <T.Label>Lines</T.Label> {0}
      </T.Stats>
      <T.Button highlight={true}>Play</T.Button>
    </T.Layout>
  )
}
