export enum TetrominoType {
  O = "O",
  I = "I",
  S = "S",
  Z = "Z",
  L = "L",
  J = "J",
  T = "T",
}

export type Cell = 0 | TetrominoType

export type Matrix = Cell[][]

export type Point = { x: number; y: number }

export type Tetromino = [Point, Point, Point, Point]

export type Tetrominos = Record<TetrominoType, Tetromino[]>

export type Colors = Record<TetrominoType, string>

export type Piece = {
  type: TetrominoType
  orientation: number
  origin: Point
}

export type Data = {
  matrix: Matrix
  falling: Piece
  next: TetrominoType[]
  ghost: Piece
  score: number
  highscore: number
  lines: number
  level: number
}
