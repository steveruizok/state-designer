import * as React from "react"
import "./styles.css"

import game from "./game"
import { useStateDesigner } from "state-designer"

import * as Shared from "./components/Shared"
import EquipSlot from "./components/EquipSlot"
import GridCell from "./components/GridCell"
import Item from "./components/Item"
import Ghost from "./components/Ghost"

type Props = {}

const Inventory: React.FC<Props> = () => {
  const { data, active, send } = useStateDesigner(game)

  // Static items

  const slots = React.useMemo(() => {
    const slots = Object.values(data.slots)

    return slots.map((slot) => <EquipSlot key={slot.id} slot={slot} />)
  }, [data.slots])

  const cells = React.useMemo(() => {
    return data.inventory.cells.map((row, y) =>
      row.map((_, x) => <GridCell key={`${y}_${x}`} x={21 + x} y={2 + y} />)
    )
  }, [data.inventory.cells.length])

  return (
    <Shared.Background>
      <Shared.Screen>
        {slots}
        {cells}
        {data.inventory.dragging && (
          <Item
            key="draggingItemCopy"
            item={data.inventory.dragging}
            offsetX={21}
            offsetY={2}
            isDragging={false}
            fixed
          />
        )}
        {data.inventory.dragging && (
          <Ghost
            key="draggingItem"
            item={data.inventory.dragging}
            offsetX={21}
            offsetY={2}
          />
        )}
        {Object.values(data.inventory.contents).map((item) => (
          <Item
            key={item.id}
            item={item}
            offsetX={21}
            offsetY={2}
            isDragging={data.inventory.dragging?.id === item.id}
            fixed={false}
          />
        ))}
      </Shared.Screen>
      <div>
        {active} — {data.inventory.dragging?.id}
      </div>
    </Shared.Background>
  )
}

export default Inventory
