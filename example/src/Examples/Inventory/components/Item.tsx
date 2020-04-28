import * as React from "react"
import { motion } from "framer-motion"

import game from "../game"
import { useStateDesigner } from "state-designer"

import * as DS from "../game/types"
import things from "../game/things"

export type Props = {
  item: DS.Item
  offsetX: number
  offsetY: number
  isDragging: boolean
  fixed: boolean
}

const Item: React.FC<Props> = ({
  item,
  offsetX,
  offsetY,
  isDragging,
  fixed,
}) => {
  const thing = things[item.thing]

  return (
    <motion.div
      style={{
        padding: 4,
        fontSize: 11,
        gridColumn: `${item.point.x + 1 + offsetX} / span ${thing.size.width}`,
        gridRow: `${item.point.y + 1 + offsetY} / span ${thing.size.height}`,
        border: isDragging ? "none" : "1px solid var(--zh-thunder)",
        backgroundColor: isDragging ? "transparent" : "var(--zh-sisal)",
        userSelect: "none",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${thing.image})`,
        backgroundSize: `80% 80%`,
      }}
      drag
      dragMomentum={false}
      whileTap={{ opacity: 0.8 }}
      transition={{ type: "tween", duration: 0 }}
      animate={fixed ? false : !isDragging}
      onTapStart={(e, info) =>
        game.send("STARTED_DRAGGING_ITEM", { id: item.id, info })
      }
      onTap={() => game.send("STOPPED_DRAGGING_BEFORE_MOVING", { id: item.id })}
      onDragEnd={(e, info) =>
        game.send("STOPPED_DRAGGING_ITEM", { id: item.id, info })
      }
      onDrag={(e, info) => game.send("DRAGGED_ITEM", { id: item.id, info })}
    ></motion.div>
  )
}

export default Item
