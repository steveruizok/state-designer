import range from "lodash-es/range"
import cloneDeep from "lodash-es/cloneDeep"
import sample from "lodash-es/sample"
import { createState } from "@state-designer/core"

import * as Tetris from "./types"
import * as Static from "./static"

const initialData: Tetris.Data = {
  matrix: range(40).map(() => range(10).map(() => 0)),
  falling: {
    type: Tetris.TetrominoType.T,
    orientation: 0,
    origin: {
      x: 4,
      y: 18,
    },
  },
  ghost: {
    type: Tetris.TetrominoType.T,
    orientation: 0,
    origin: {
      x: 0,
      y: 0,
    },
  },
  next: [
    Tetris.TetrominoType.S,
    Tetris.TetrominoType.O,
    Tetris.TetrominoType.I,
    Tetris.TetrominoType.Z,
    Tetris.TetrominoType.T,
    Tetris.TetrominoType.J,
  ],
  score: 0,
  highscore: 0,
  lines: 0,
  level: 0,
}

const game = createState({
  data: initialData,
  initial: "playing",
  states: {
    start: {},
    playing: {
      on: {
        MOVED_LEFT: {
          get: "fallingPieceMovedLeft",
          if: "pieceWillFitInMatrix",
          do: ["moveFallingPieceLeft", "updateGhostPiece"],
        },
        MOVED_RIGHT: {
          get: "fallingPieceMovedRight",
          if: "pieceWillFitInMatrix",
          do: ["moveFallingPieceRight", "updateGhostPiece"],
        },
        ROTATED_CLOCKWISE: {
          get: "fallingPieceRotatedClockwise",
          if: "pieceWillFitInMatrix",
          do: ["rotateFallingPieceClockwise", "updateGhostPiece"],
        },
        HARD_DROPPED: [
          {
            do: "moveFallingPieceToGhostPiece",
            to: "locking",
          },
        ],
      },
      initial: "falling",
      states: {
        locking: {
          onEnter: [
            "lockFallingPieceIntoPlace",
            {
              get: "completedLinesInMatrix",
              if: "matrixHasCompletedLines",
              do: ["clearCompletedLines", "updateStats", "updateLevel"],
            },
            "setNewFallingPiece",
            "setNextPiece",
            "updateGhostPiece",
            {
              get: "fallingPiece",
              unless: "pieceWillFitInMatrix",
              to: "gameover",
              else: {
                to: "falling",
              },
            },
          ],
        },
        falling: {
          repeat: {
            onRepeat: [
              {
                get: "fallingPieceMovedDown",
                if: "pieceWillFitInMatrix",
                do: ["moveFallingPieceDown", "updateGhostPiece"],
                else: {
                  to: "locking",
                },
              },
            ],
            delay: "fallingInterval",
          },
          on: {
            STARTED_DROP: {
              to: "dropping",
            },
          },
        },
        dropping: {
          repeat: {
            onRepeat: [
              {
                get: "fallingPieceMovedDown",
                if: "pieceWillFitInMatrix",
                do: ["moveFallingPieceDown", "updateGhostPiece"],
                else: {
                  to: "locking",
                },
              },
            ],
            delay: "droppingInterval",
          },
          on: {
            STOPPED_DROP: {
              to: "falling",
            },
          },
        },
      },
    },
    gameover: {
      onEnter: () => console.log("Game over!"),
    },
  },
  results: {
    fallingPiece(data) {
      return data.falling
    },
    fallingPieceMovedLeft(data) {
      const piece = cloneDeep(data.falling)
      piece.origin.x -= 1
      return piece
    },
    fallingPieceMovedRight(data) {
      const piece = cloneDeep(data.falling)
      piece.origin.x += 1
      return piece
    },
    fallingPieceMovedDown(data) {
      const piece = cloneDeep(data.falling)
      piece.origin.y += 1
      return piece
    },
    fallingPieceRotatedClockwise(data) {
      const piece = cloneDeep(data.falling)
      piece.orientation = (piece.orientation + 1) % 4
      return piece
    },
    completedLinesInMatrix(data) {
      let lines: number[] = []

      data.matrix.forEach((row, i) => {
        if (row.every(Boolean)) {
          lines.push(i)
        }
      })

      return lines
    },
  },
  conditions: {
    matrixHasCompletedLines(_, __, lines: number[]) {
      return lines.length > 0
    },
    pieceWillFitInMatrix(data, _, piece: Tetris.Piece) {
      const { type, orientation, origin } = piece
      const tetromino = Static.tetrominos[type][orientation]

      return tetromino.every((point) => {
        const matrixX = origin.x + point.x
        const matrixY = origin.y + point.y

        if (!data.matrix[matrixY]) return false

        return data.matrix[matrixY][matrixX] === 0
      })
    },
  },
  actions: {
    moveFallingPieceLeft(data) {
      data.falling.origin.x--
    },
    moveFallingPieceRight(data) {
      data.falling.origin.x++
    },
    moveFallingPieceDown(data) {
      data.falling.origin.y++
    },
    rotateFallingPieceClockwise(data) {
      data.falling.orientation = (data.falling.orientation + 1) % 4
    },
    lockFallingPieceIntoPlace(data) {
      const { type, orientation, origin } = data.falling
      const tetromino = Static.tetrominos[type][orientation]

      tetromino.forEach((point) => {
        const matrixX = origin.x + point.x
        const matrixY = origin.y + point.y

        data.matrix[matrixY][matrixX] = type
      })
    },
    updateGhostPiece(data) {
      const { type, orientation } = data.falling
      const origin = { ...data.falling.origin }
      const tetromino = Static.tetrominos[type][orientation]

      while (true) {
        const fits = tetromino.every((point) => {
          const matrixX = origin.x + point.x
          const matrixY = origin.y + point.y + 1

          if (!data.matrix[matrixY]) return false

          return data.matrix[matrixY][matrixX] === 0
        })

        if (fits) {
          origin.y++
        } else {
          break
        }
      }

      Object.assign(data.ghost, { type, orientation, origin })
    },
    moveFallingPieceToGhostPiece(data) {
      data.falling.origin = data.ghost.origin
    },
    setNewFallingPiece(data) {
      const type = data.next.shift() || Tetris.TetrominoType.S

      data.falling = {
        type,
        origin: { x: 4, y: 18 },
        orientation: 0,
      }
    },
    setNextPiece(data) {
      const randomType = sample(Tetris.TetrominoType) || Tetris.TetrominoType.S

      data.next.push(randomType)
    },
    clearCompletedLines(data, _, lines: number[]) {
      for (let i of lines) {
        for (let j = i; j > 0; j--) {
          data.matrix[j] = data.matrix[j - 1]
        }
      }

      data.matrix[0] = range(10).map(() => 0)
    },
    updateStats(data, _, lines: number[]) {
      data.score += Static.scores[lines.length]
      data.lines += lines.length
    },
    updateLevel(data) {
      data.level = Math.ceil(data.lines / 10)
    },
  },
  times: {
    fallingInterval(data) {
      return Static.levelIntervals[data.level] || 0.1
    },
    droppingInterval(data) {
      return (Static.levelIntervals[data.level] || 0.1) / 20 // x20 speed
    },
  },
})

export default game
