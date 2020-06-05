import { createState } from "@state-designer/core"
import { range, sample, cloneDeep } from "utils"
import * as Static from "./static"

const initialData = {
  matrix: range(40).map(() => range(10).map(() => 0)),
  falling: {
    type: Static.TetrominoType.T,
    orientation: 0,
    origin: {
      x: 4,
      y: 18,
    },
  },
  ghost: {
    type: Static.TetrominoType.T,
    orientation: 0,
    origin: {
      x: 0,
      y: 0,
    },
  },
  next: [
    Static.TetrominoType.S,
    Static.TetrominoType.O,
    Static.TetrominoType.I,
    Static.TetrominoType.Z,
    Static.TetrominoType.T,
    Static.TetrominoType.J,
  ],
  score: 0,
  highscore: 0,
  lines: 0,
  level: 0,
}

const game = createState({
  data: initialData,
  initial: "start",
  states: {
    start: {
      on: {
        STARTED: { to: "playing" },
      },
    },
    paused: {
      on: {
        STARTED: { to: "playing" },
      },
    },
    playing: {
      on: {
        STARTED: { to: "paused" },
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
      on: {
        STARTED: {
          do: "resetGame",
          to: "playing",
        },
      },
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
      let lines = []

      data.matrix.forEach((row, i) => {
        if (row.every(Boolean)) {
          lines.push(i)
        }
      })

      return lines
    },
  },
  conditions: {
    matrixHasCompletedLines(data, payload, lines) {
      return lines.length > 0
    },
    pieceWillFitInMatrix(data, _, piece) {
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
    resetGame(data) {
      data.matrix = range(40).map(() => range(10).map(() => 0))
      data.score = 0
      data.highscore = 0
      data.lines = 0
      data.level = 0
    },
    moveFallingPieceLeft(data) {
      data.falling.origin.x--
    },
    moveFallingPieceRight(data) {
      data.falling.origin.x++
    },
    moveFallingPieceDown(data, _, piece) {
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
      const type = data.next.shift() || Static.TetrominoType.S

      data.falling = {
        type,
        origin: { x: 4, y: 18 },
        orientation: 0,
      }
    },
    setNextPiece(data) {
      const randomType = sample(Static.TetrominoType) || Static.TetrominoType.S

      data.next.push(randomType)
    },
    clearCompletedLines(data, _, lines) {
      for (let i of lines) {
        for (let j = i; j > 0; j--) {
          data.matrix[j] = data.matrix[j - 1]
        }
      }

      data.matrix[0] = range(10).map(() => 0)
    },
    updateStats(data, _, lines) {
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
