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
  origin: Point
  type: TetrominoType
  tetromino: Tetromino
  rotation: number
}

export type Tetromino = number[][]

export type Piece = Tetromino[]

export type Grid = (TetrominoType | 0)[][]
