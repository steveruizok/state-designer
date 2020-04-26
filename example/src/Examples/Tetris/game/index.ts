import range from "lodash-es/range"
import sample from "lodash-es/sample"
import { createStateDesigner } from "state-designer"
import {
  TetrominoType,
  Tetromino,
  FallingTetromino,
  Grid,
  Point,
  Piece,
} from "./types"
import { pieces, intervals } from "./assets"

const game = createStateDesigner({
  data: {
    level: 1,
    score: 0,
    lines: 0,
    highscore: parseInt(localStorage.getItem("tetris_highscore") || "0"),
    grid: range(20).map((y) => range(10).map((x) => 0)) as Grid,
    current: undefined as FallingTetromino | undefined,
    next: {
      type: TetrominoType.I,
      tetromino: pieces[TetrominoType.I][1],
      rotation: 1,
    },
  },
  initial: "ready",
  states: {
    ready: {
      on: {
        GAME_STARTED: {
          to: "playing",
        },
      },
    },
    playing: {
      onEnter: ["clearGrid", "resetScore", "resetLines", "setLevel"],
      initial: "waiting",
      states: {
        waiting: {
          onEnter: [
            {
              do: ["setCurrentTetromino", "setNextTetromino"],
            },
            {
              to: "creating",
              wait: (data) => intervals[data.level] || 0.1,
            },
          ],
        },
        creating: {
          onEnter: [
            {
              get: "current",
              unless: "currentTetrominoCanMoveDown",
              to: "gameover",
            },
            {
              to: "fallSlowly",
            },
          ],
        },
        fallSlowly: {
          repeat: {
            event: [
              {
                get: "current",
                unless: "currentTetrominoCanMoveDown",
                do: [
                  "lockCurrentTetromino",
                  "removeFullRows",
                  "clearCurrentTetromino",
                ],
                to: "waiting",
              },
              {
                get: "current",
                do: "moveCurrentTerominoDown",
              },
            ],
            delay: (data) => intervals[data.level] || 0.1,
          },
          on: {
            ROTATED: {
              get: "current",
              if: "currentTetrominoCanRotate",
              do: "rotateTetromino",
            },
            MOVED_LEFT: {
              get: "current",
              if: "currentTetrominoCanMoveLeft",
              do: "moveCurrentTetrominoLeft",
            },
            MOVED_RIGHT: {
              get: "current",
              if: "currentTetrominoCanMoveRight",
              do: "moveCurrentTetrominoRight",
            },
            STARTED_MOVE_DOWN: {
              to: "fallFast",
            },
          },
        },
        fallFast: {
          repeat: {
            event: [
              {
                get: "current",
                unless: "currentTetrominoCanMoveDown",
                do: [
                  "lockCurrentTetromino",
                  "removeFullRows",
                  "setLevel",
                  "clearCurrentTetromino",
                ],
                to: "waiting",
              },
              {
                get: "current",
                do: "moveCurrentTerominoDown",
              },
            ],
            delay: (data) => (intervals[data.level] || 0.1) / 20,
          },
          on: {
            ENDED_MOVE_DOWN: {
              to: "fallSlowly",
            },
          },
        },
      },
    },
    gameover: {
      on: {
        GAME_STARTED: {
          do: "clearGrid",
          to: "playing",
        },
      },
    },
  },
  results: {
    current(data) {
      return data.current
    },
  },
  conditions: {
    currentTetrominoCanMoveLeft(data, _, current: FallingTetromino) {
      const { origin, tetromino } = current
      const nextOrigin = { ...origin }
      nextOrigin.x--

      return validPosition(nextOrigin, tetromino, data.grid)
    },
    currentTetrominoCanMoveRight(data, _, current: FallingTetromino) {
      const { origin, tetromino } = current
      const nextOrigin = { ...origin }
      nextOrigin.x++

      return validPosition(nextOrigin, tetromino, data.grid)
    },
    currentTetrominoCanMoveDown(data, _, current: FallingTetromino) {
      const { origin, tetromino } = current
      const nextOrigin = { ...origin }
      nextOrigin.y++

      return validPosition(nextOrigin, tetromino, data.grid)
    },
    currentTetrominoCanRotate(data, _, current: FallingTetromino) {
      const { origin, rotation, type } = current
      const piece = pieces[type]
      const nextRotation = (rotation + 1) % piece.length
      const nextTetromino = piece[nextRotation]

      return validPosition(origin, nextTetromino, data.grid)
    },
  },
  actions: {
    resetScore(data) {
      data.score = 0
    },
    resetLines(data) {
      data.lines = 0
    },
    clearGrid(data) {
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
          data.grid[i][j] = 0
        }
      }
    },
    moveCurrentTetrominoLeft(data, _, current: FallingTetromino) {
      current.origin.x--
    },
    moveCurrentTetrominoRight(data, _, current: FallingTetromino) {
      current.origin.x++
    },
    moveCurrentTerominoDown(data, _, current: FallingTetromino) {
      current.origin.y++
    },
    lockCurrentTetromino(data, _, current: FallingTetromino) {
      const { tetromino, origin, type } = current

      tetromino.forEach((row, y) =>
        row.forEach((cell, x) => {
          const gx = origin.x + x - 2
          const gy = origin.y + y - 1

          if (cell && data.grid[gy]) {
            data.grid[gy][gx] = type
          }
        })
      )
    },
    removeFullRows(data) {
      const { grid } = data

      let removedRows = 0

      for (let i = 0; i < 20; i++) {
        const row = grid[i]

        if (row.every((cell) => cell !== 0)) {
          removedRows++

          for (let j = i; j > 1; j--) {
            grid[j] = grid[j - 1]
          }

          for (let cell of grid[0]) {
            cell = 0
          }
        }
      }

      if (removedRows > 0) {
        const scores = [0, 40, 100, 300, 1200]

        data.score += scores[removedRows] * (data.level + 1)
        data.lines += removedRows

        if (data.score > data.highscore) {
          data.highscore = data.score
        }
      }
    },
    setLevel(data) {
      data.level = Math.ceil(data.lines / 10)
    },
    rotateTetromino(data, _, current: FallingTetromino) {
      const piece = pieces[current.type]
      current.rotation++
      current.tetromino = piece[current.rotation % piece.length]
    },
    setCurrentTetromino(data) {
      data.current = {
        ...data.next,
        origin: { x: 3, y: -1 },
      }
    },
    clearCurrentTetromino(data) {
      data.current = undefined
    },
    setNextTetromino(data) {
      const type = sample(Object.keys(pieces)) as TetrominoType
      const rotation = Math.floor(Math.random() * 4)
      const piece = pieces[type]
      const tetromino = piece[rotation % piece.length]

      data.next = {
        type,
        rotation,
        tetromino,
      }
    },
  },
})

// Update local highscore on updates
game.subscribe(({ data }) => {
  localStorage.setItem("tetris_highscore", data.highscore.toString())
})

export default game

// Helpers
function validPosition(origin: Point, tetromino: Tetromino, grid: Grid) {
  return tetromino.every((row, y) =>
    row.every((cell, x) => {
      const gx = origin.x + x - 2
      const gy = origin.y + y - 1

      const gCell = grid[gy]?.[gx]

      if (cell && gy >= 0) {
        if (gCell || gCell === undefined) {
          return false
        }
      }

      return true
    })
  )
}
