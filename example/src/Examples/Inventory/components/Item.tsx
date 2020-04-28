import * as React from "react"
import { motion } from "framer-motion"

import game from "../game"
import { useStateDesigner } from "state-designer"

import * as DS from "../game/types"
import things from "../game/things"

export type Props = {
  item: DS.Item
  isDragging: boolean
  fixed?: boolean
}

const Item: React.FC<Props> = ({ item, isDragging, fixed = false }) => {
  const { data, isIn } = useStateDesigner(game)

  const thing = things[item.thing]
  const slot = item.slot ? data.slots[item.slot] : undefined

  return (
    <motion.div
      className={isDragging ? "" : "textured"}
      style={{
        padding: 4,
        fontSize: 11,
        gridColumn: `${item.point.x + 1} / span ${
          slot && !isDragging ? slot.size.width : thing.size.width
        }`,
        gridRow: `${item.point.y + 1} / span ${
          slot && !isDragging ? slot.size.height : thing.size.height
        }`,
        border: isDragging ? "none" : "1px solid var(--zh-thunder)",
        userSelect: "none",
      }}
      drag
      dragMomentum={false}
      whileTap={{ opacity: 0.8 }}
      transition={{ type: "tween", duration: 0 }}
      animate={fixed ? false : !isDragging}
      onTapStart={(e, info) =>
        game.send("STARTED_DRAGGING_ITEM", { id: item.id, info })
      }
      onClick={(e) =>
        e.metaKey && game.send("QUICK_EQUIPPED_ITEM", { id: item.id })
      }
      onTap={() => game.send("STOPPED_DRAGGING_BEFORE_MOVING", { id: item.id })}
      onDragEnd={(e, info) =>
        game.send("STOPPED_DRAGGING_ITEM", { id: item.id, info })
      }
      onDrag={(e, info) => game.send("DRAGGED_ITEM", { id: item.id, info })}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url(${thing.image})`,
          backgroundSize: `80%`,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  )
}

export default Item
