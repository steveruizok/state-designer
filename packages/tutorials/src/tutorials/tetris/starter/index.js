import React from "react"
import { Tetris, VStack } from "components"
import { colors, tetrominos } from "./static"
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
  useInputs()

  return (
    <Layout>
      <PlayField>
        <Layer>
          <MatrixTetromino color={colors["O"]} />
          <MatrixTetromino color={colors["I"]} />
          <MatrixTetromino color={colors["S"]} />
          <MatrixTetromino color={colors["Z"]} />
          <MatrixTetromino color={colors["L"]} />
          <MatrixTetromino color={colors["J"]} />
          <MatrixTetromino color={colors["T"]} />
        </Layer>
        <Layer>
          <Piece
            tetrominos={tetrominos["Z"][0]}
            color={colors["Z"]}
            x={2}
            y={4}
          />
          <GhostPiece tetrominos={tetrominos["Z"][0]} x={2} y={18} />
        </Layer>
      </PlayField>
      <NextField>
        <Piece
          tetrominos={tetrominos["T"][0]}
          color={colors["T"]}
          x={0}
          y={0}
        />
      </NextField>
      <VStack>
        <Stats>
          <Label>Score</Label> {0}
          <Label>Level</Label> {0}
          <Label>Lines</Label> {0}
        </Stats>
        <Button highlight={true}>Play</Button>
      </VStack>
    </Layout>
  )
}
