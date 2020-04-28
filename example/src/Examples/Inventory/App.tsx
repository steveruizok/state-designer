import * as React from "react"
import "./styles.css"

import game from "./game"
import { useStateDesigner } from "state-designer"

import useRefs from "./hooks/useRefs"

import * as Shared from "./components/Shared"
import Slot from "./components/Slot"
import SlotGhost from "./components/SlotGhost"
import GridCell from "./components/GridCell"
import Item from "./components/Item"
import GridGhost from "./components/GridGhost"

type Props = {}

const Inventory: React.FC<Props> = () => {
  const { data, active, isIn, send } = useStateDesigner(game)

  const { register, refs, getRef } = useRefs<HTMLDivElement>()

  // Static items

  const cells = React.useMemo(() => {
    return data.inventory.cells.map((row, y) =>
      row.map((_, x) => <GridCell key={`${y}_${x}`} x={21 + x} y={2 + y} />)
    )
  }, [data.inventory.cells.length])

  return (
    <Shared.Background>
      <Shared.Screen>
        {Object.values(data.slots).map((slot) => (
          <Slot
            key={"droppable_slot" + slot.id}
            slot={slot}
            item={slot.item ? data.inventory.contents[slot.item] : undefined}
          />
        ))}
        {cells}
        {isIn("draggingSlots") && data.inventory.dragging?.slot && (
          <SlotGhost
            key="dragging_item_valid_slot_ghost"
            item={data.inventory.dragging}
            slot={data.slots[data.inventory.dragging.slot]}
          />
        )}
        {isIn("draggingGrid") && data.inventory.dragging && (
          <GridGhost
            key="dragging_item_valid_grid_ghost"
            item={data.inventory.dragging}
          />
        )}
        {data.inventory.dragging && (
          <Item
            key="copy_of_dragging_item"
            item={data.inventory.dragging}
            isDragging={false}
            fixed
          />
        )}
        {Object.values(data.inventory.contents).map((item) => (
          <Item
            key={"draggable_item" + item.id}
            item={item}
            isDragging={data.inventory.dragging?.id === item.id}
          />
        ))}
      </Shared.Screen>
      {/* <div>
        {active.join(" ")} — {data.inventory.dragging?.id}
      </div> */}
    </Shared.Background>
  )
}

export default Inventory
