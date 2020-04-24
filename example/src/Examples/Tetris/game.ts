import range from "lodash-es/range"
import sample from "lodash-es/sample"
import { createStateDesigner } from "state-designer"
import { TetrominoType, Tetromino, FallingTetromino, Grid } from "./types"

export default createStateDesigner({
  data: {
    grid: range(20).map((y) => range(10).map((x) => undefined)) as Grid,
    current: undefined as FallingTetromino | undefined,
    next: TetrominoType.T as TetrominoType,
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
      initial: "waiting",
      states: {
        waiting: {
          onEnter: {
            do: ["setCurrentTetromino", "setNextTetromino"],
            to: "falling",
            wait: 1,
          },
        },
        falling: {
          repeat: {
            event: [
              {
                get: "current",
                do: "moveCurrentTerominoDown",
              },
              {
                get: "current",
                if: "tetrominoDidCollide",
                do: [
                  "lockCurrentTetromino",
                  "removeRows",
                  "clearCurrentTetromino",
                ],
                to: "waiting",
              },
            ],
            delay: 2,
          },
          on: {
            MOVED_LEFT: {
              get: "current",
              do: "moveCurrentTetrominoLeft",
            },
            MOVED_RIGHT: {
              get: "current",
              do: "moveCurrentTetrominoRight",
            },
            MOVED_DOWN: {
              to: "movingDown",
            },
          },
        },
        movingDown: {
          repeat: {
            event: [
              {
                get: "current",
                do: "moveCurrentTerominoDown",
              },
              {
                get: "current",
                if: "tetrominoDidCollide",
                do: [
                  "lockCurrentTetromino",
                  "removeRows",
                  "clearCurrentTetromino",
                ],
                to: "waiting",
              },
            ],
            delay: 0.005,
          },
        },
      },
    },
    won: {},
  },
  results: {
    current(data) {
      return data.current
    },
  },
  conditions: {
    tetrominoDidCollide(data) {
      if (!data.current) return false

      const tetromino = tetrominos[data.current.teromino]

      for (let point of tetromino) {
        const x = point.x + data.current.point.x
        const y = point.y + data.current.point.y + 1

        if (!data.grid[y] || data.grid[y][x] !== undefined) {
          return true
        }
      }

      return false
    },
    hasCurrentTetromino(data) {
      return data.current !== undefined
    },
  },
  actions: {
    moveCurrentTetrominoLeft(data, _, current: FallingTetromino) {
      current.point.x--
    },
    moveCurrentTetrominoRight(data, _, current: FallingTetromino) {
      current.point.x++
    },
    moveCurrentTerominoDown(data, _, current: FallingTetromino) {
      current.point.y++
    },
    lockCurrentTetromino(data, _, current: FallingTetromino) {
      for (let point of tetrominos[current.teromino]) {
        const x = point.x + current.point.x
        const y = point.y + current.point.y

        data.grid[y][x] = current.teromino
      }
    },
    removeRows() {},
    setCurrentTetromino(data) {
      data.current = {
        teromino: data.next,
        rotation: 0,
        point: { x: 1, y: 0 },
      }
    },
    clearCurrentTetromino(data) {
      data.current = undefined
    },
    setNextTetromino(data) {
      data.next = sample(Object.keys(tetrominos)) as TetrominoType
    },
  },
})

export const tetrominos: Record<TetrominoType, Tetromino> = {
  i: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],
  o: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  l: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  j: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  t: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
  ],
  s: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  z: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
}

export const colors: Record<TetrominoType, string> = {
  i: "rgb(128, 0, 0)",
  o: "rgb(6, 0, 128)",
  l: "rgb(128, 1, 128)",
  j: "rgb(192, 192, 192)",
  t: "rgb(129, 128, 0)",
  s: "rgb(0, 128, 1)",
  z: "rgb(0, 128, 128)",
}
