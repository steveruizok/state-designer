import { createState } from '@state-designer/react'
import { levelIntervals, scores, tetrominos, TetrominoType } from './constants'
import { current } from 'immer'

export const state = createState({
  data: {
    matrix: Array.from(Array(40)).map(() => Array.from(Array(10)).fill(0)),
    falling: {
      type: TetrominoType.T,
      orientation: 0,
      origin: {
        x: 4,
        y: 18,
      },
    },
    ghost: {
      type: TetrominoType.T,
      orientation: 0,
      origin: {
        x: 0,
        y: 0,
      },
    },
    next: [
      TetrominoType.S,
      TetrominoType.O,
      TetrominoType.I,
      TetrominoType.Z,
      TetrominoType.T,
      TetrominoType.J,
    ],
    score: 0,
    highScore: 0,
    lines: 0,
    level: 0,
  },
  onEnter: 'loadHighScore',
  initial: 'start',
  states: {
    start: {
      on: {
        STARTED: { to: 'playing' },
      },
    },
    paused: {
      on: {
        STARTED: { to: 'playing' },
      },
    },
    playing: {
      on: {
        STARTED: { to: 'paused' },
        MOVED_LEFT: {
          get: 'fallingPieceMovedLeft',
          if: 'pieceWillFitInMatrix',
          do: ['moveFallingPieceLeft', 'updateGhostPiece'],
        },
        MOVED_RIGHT: {
          get: 'fallingPieceMovedRight',
          if: 'pieceWillFitInMatrix',
          do: ['moveFallingPieceRight', 'updateGhostPiece'],
        },
        ROTATED_CLOCKWISE: {
          get: 'fallingPieceRotatedClockwise',
          if: 'pieceWillFitInMatrix',
          do: ['rotateFallingPieceClockwise', 'updateGhostPiece'],
        },
        HARD_DROPPED: [
          {
            do: 'moveFallingPieceToGhostPiece',
            to: 'locking',
          },
        ],
      },
      initial: 'falling',
      states: {
        locking: {
          onEnter: [
            'lockFallingPieceIntoPlace',
            {
              get: 'completedLinesInMatrix',
              if: 'matrixHasCompletedLines',
              do: ['clearCompletedLines', 'updateStats', 'updateLevel'],
              then: {
                if: 'newHighScore',
                do: 'saveHighScore',
              },
            },
            'setNewFallingPiece',
            'setNextPiece',
            'updateGhostPiece',
            {
              get: 'fallingPiece',
              unless: 'pieceWillFitInMatrix',
              to: 'gameover',
              else: { to: 'falling' },
            },
          ],
        },
        falling: {
          repeat: {
            onRepeat: [
              {
                get: 'fallingPieceMovedDown',
                if: 'pieceWillFitInMatrix',
                do: ['moveFallingPieceDown', 'updateGhostPiece'],
                else: { to: 'locking' },
              },
            ],
            delay: 'fallingInterval',
          },
          on: {
            STARTED_DROP: {
              to: 'dropping',
            },
          },
        },
        dropping: {
          repeat: {
            onRepeat: [
              {
                get: 'fallingPieceMovedDown',
                if: 'pieceWillFitInMatrix',
                do: ['moveFallingPieceDown', 'updateGhostPiece'],
                else: {
                  to: 'locking',
                },
              },
            ],
            delay: 'droppingInterval',
          },
          on: {
            STOPPED_DROP: {
              to: 'falling',
            },
          },
        },
      },
    },
    gameover: {
      onEnter: 'saveHighScore',
      on: {
        STARTED: {
          do: 'resetGame',
          to: 'playing',
        },
      },
    },
  },
  results: {
    fallingPiece(data) {
      return data.falling
    },
    fallingPieceMovedLeft(data) {
      const piece = current(data.falling)
      piece.origin.x -= 1
      return piece
    },
    fallingPieceMovedRight(data) {
      const piece = current(data.falling)
      piece.origin.x += 1
      return piece
    },
    fallingPieceMovedDown(data) {
      const piece = current(data.falling)
      piece.origin.y += 1
      return piece
    },
    fallingPieceRotatedClockwise(data) {
      const piece = current(data.falling)
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
    matrixHasCompletedLines(data, payload, lines) {
      return lines.length > 0
    },
    pieceWillFitInMatrix(data, payload, piece) {
      const { type, orientation, origin } = piece
      const tetromino = tetrominos[type][orientation]

      return tetromino.every((point) => {
        const matrixX = origin.x + point.x
        const matrixY = origin.y + point.y

        if (!data.matrix[matrixY]) return false

        return data.matrix[matrixY][matrixX] === 0
      })
    },
    newHighScore(data) {
      return data.score > data.highScore
    },
  },
  actions: {
    resetGame(data) {
      data.matrix = Array.from(Array(40)).map(() => Array.from(Array(10)).fill(0))
      data.score = 0
      data.highScore = 0
      data.lines = 0
      data.level = 0
    },
    moveFallingPieceLeft(data) {
      data.falling.origin.x--
    },
    moveFallingPieceRight(data) {
      data.falling.origin.x++
    },
    moveFallingPieceDown(data, payload, piece) {
      data.falling.origin.y++
    },
    rotateFallingPieceClockwise(data) {
      data.falling.orientation = (data.falling.orientation + 1) % 4
    },
    lockFallingPieceIntoPlace(data) {
      const { type, orientation, origin } = data.falling
      const tetromino = tetrominos[type][orientation]

      tetromino.forEach((point) => {
        const matrixX = origin.x + point.x
        const matrixY = origin.y + point.y

        data.matrix[matrixY][matrixX] = type
      })
    },
    updateGhostPiece(data) {
      const { type, orientation } = data.falling
      const origin = { ...data.falling.origin }
      const tetromino = tetrominos[type][orientation]

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
      const type = data.next.shift() || TetrominoType.S

      data.falling = {
        type,
        origin: { x: 4, y: 18 },
        orientation: 0,
      }
    },
    setNextPiece(data) {
      const randomType =
        Object.values(TetrominoType)[
          Math.floor(Math.random() * Object.values(TetrominoType).length)
        ] || TetrominoType.S

      data.next.push(randomType)
    },
    clearCompletedLines(data, payload, lines) {
      for (let i of lines) {
        for (let j = i; j > 0; j--) {
          data.matrix[j] = data.matrix[j - 1]
        }
      }

      data.matrix[0] = Array.from(Array(10)).fill(0)
    },
    updateStats(data, payload, lines) {
      data.score += scores[lines.length]
      data.lines += lines.length
    },
    updateLevel(data) {
      data.level = Math.ceil(data.lines / 10)
    },
    saveHighScore(data) {
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          localStorage.setItem('sd_tetris_highscore', data.score.toString())
        }
      }
    },
    loadHighScore(data) {
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          const loaded = localStorage.getItem('sd_tetris_highscore')
          if (loaded !== null) {
            data.highScore = parseInt(loaded)
          }
        }
      }
    },
  },
  times: {
    fallingInterval(data) {
      return levelIntervals[data.level] || 0.1
    },
    droppingInterval(data) {
      return (levelIntervals[data.level] || 0.1) / 20 // x20 speed
    },
  },
  values: {
    lockedSquares(data) {
      return data.matrix
        .slice(-20)
        .flatMap((row, y) => row.map((type, x) => ({ x, y, type })))
        .filter(({ type }) => type !== 0)
    },
    highScore(data) {
      return Math.max(data.highScore, data.score)
    },
  },
})
