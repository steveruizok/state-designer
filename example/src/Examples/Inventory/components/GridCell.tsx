import * as React from "react"
import * as Shared from "./Shared"
import * as DS from "../game/types"

export type Props = {
  x: number
  y: number
}

const GridCell: React.FC<Props> = ({ x, y }) => {
  return (
    <Shared.Box
      x={x}
      y={y}
      height={1}
      width={1}
      style={{
        backgroundColor: "var(--zh-don-juan)",
        border: `1px solid var(--zh-thunder)`,
      }}
    />
  )
}

export default GridCell
