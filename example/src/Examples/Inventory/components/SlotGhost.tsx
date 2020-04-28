import * as React from "react"
import { motion } from "framer-motion"

import game from "../game"
import { useStateDesigner } from "state-designer"

import * as Shared from "./Shared"
import * as DS from "../game/types"
import things from "../game/things"

export type Props = {
  item: DS.Item
  slot: DS.Slot
}

const SlotGhost: React.FC<Props> = ({ item, slot }) => {
  const { isIn } = useStateDesigner(game)
  const thing = things[item.thing]

  return (
    <div
      style={{
        padding: 4,
        fontSize: 10,
        gridColumn: `${slot.point.x + 1} / span ${slot.size.width}`,
        gridRow: `${slot.point.y + 1} / span ${slot.size.height}`,
        border: "1px solid var(--zh-thunder)",
        backgroundColor: isIn("valid")
          ? "var(--zh-goblin)"
          : "var(--zh-medium-carmine)",
        userSelect: "none",
      }}
    ></div>
  )
}

export default SlotGhost
