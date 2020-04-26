import { TetrominoType } from "../../game/types"

import I from "./IBlock"
import O from "./OBlock"
import S from "./SBlock"
import Z from "./ZBlock"
import L from "./LBlock"
import J from "./JBlock"
import T from "./TBlock"

const blocks: Record<TetrominoType, any> = {
  i: I,
  o: O,
  s: S,
  z: Z,
  l: L,
  j: J,
  t: T,
}

export default blocks
