export interface Point {
  x: number
  y: number
}

export enum TetrominoType {
  I = "i",
  O = "o",
  L = "l",
  J = "j",
  T = "t",
  S = "s",
  Z = "z",
}

export type FallingTetromino = {
  point: Point
  teromino: TetrominoType
  rotation: number
}

export type Tetromino = [Point, Point, Point, Point]

export type Grid = (TetrominoType | undefined)[][]
