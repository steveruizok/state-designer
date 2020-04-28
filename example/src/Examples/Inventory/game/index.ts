import range from "lodash-es/range"
import cloneDeep from "lodash-es/cloneDeep"
import uniqueId from "lodash-es/uniqueId"
import { PanInfo } from "framer-motion"
import { createStateDesigner } from "state-designer"
import * as DS from "./types"
import things from "./things"
import slots from "./slots"

type DragEvent = { id: string; info: PanInfo }

const data: DS.Data = {
  equipped: [],
  things,
  slots,
  inventory: {
    dragging: undefined,
    contents: {},
    cells: range(20).map((y) => range(10).map((x) => ".")),
  },
}

const game = createStateDesigner({
  data,
  initial: "idle",
  on: {
    ADD_ITEMS: "addItems",
    QUICK_EQUIPPED_ITEM: {
      do: "swapItem",
      to: "idle",
    },
  },
  states: {
    idle: {
      on: {
        STARTED_DRAGGING_ITEM: {
          do: "setDraggingItem",
          to: "draggingItem",
        },
      },
    },
    draggingItem: {
      on: {
        STOPPED_DRAGGING_BEFORE_MOVING: {
          do: "clearDraggingItem",
          to: "idle",
        },
      },
      initial: "draggingGrid",
      onEnter: [
        {
          get: "draggingPoint",
          if: "isHoveringGrid",
          to: "draggingGrid",
        },
        {
          to: "draggingSlots",
        },
      ],
      states: {
        draggingGrid: {
          on: {
            DRAGGED_ITEM: {
              get: "draggingPoint",
              unless: "isHoveringGrid",
              to: "draggingSlots",
            },
            STOPPED_DRAGGING_ITEM: [
              {
                get: "draggingPoint",
                if: "pointIsValidInGrid",
                do: ["updateDraggingItem", "setItemInGrid"],
              },
              {
                do: "clearDraggingItem",
                to: "idle",
              },
            ],
          },
          initial: "valid",
          states: {
            valid: {
              on: {
                DRAGGED_ITEM: [
                  {
                    get: "draggingPoint",
                    if: "pointIsDraggingItemPoint",
                    break: true,
                  },
                  {
                    get: "draggingPoint",
                    do: "updateDraggingItem",
                  },
                  {
                    get: "draggingPoint",
                    unless: "pointIsValidInGrid",
                    to: "invalid",
                  },
                ],
              },
            },
            invalid: {
              on: {
                DRAGGED_ITEM: [
                  {
                    get: "draggingPoint",
                    if: "pointIsDraggingItemPoint",
                    break: true,
                  },
                  {
                    get: "draggingPoint",
                    do: "updateDraggingItem",
                  },
                  {
                    get: "draggingPoint",
                    if: "pointIsValidInGrid",
                    to: "valid",
                  },
                ],
              },
            },
          },
        },
        draggingSlots: {
          on: {
            DRAGGED_ITEM: {
              get: "draggingPoint",
              if: "isHoveringGrid",
              to: "draggingGrid",
            },
          },
          initial: "valid",
          states: {
            valid: {
              on: {
                DRAGGED_ITEM: [
                  {
                    get: ["draggingPoint", "hoveredSlot"],
                    unless: "slotIsDraggingItemSlot",
                    do: "updateDraggingItemSlot",
                  },
                  {
                    get: ["draggingPoint", "hoveredSlot"],
                    unless: "slotIsValid",
                    to: "invalid",
                  },
                ],
                STOPPED_DRAGGING_ITEM: [
                  {
                    get: ["draggingPoint", "hoveredSlot"],
                    if: "slotIsValid",
                    do: "setItemInSlot",
                  },
                  {
                    do: "clearDraggingItem",
                    to: "idle",
                  },
                ],
              },
            },
            invalid: {
              on: {
                DRAGGED_ITEM: [
                  {
                    get: ["draggingPoint", "hoveredSlot"],
                    unless: "slotIsDraggingItemSlot",
                    do: "updateDraggingItemSlot",
                  },
                  {
                    get: ["draggingPoint", "hoveredSlot"],
                    if: "slotIsValid",
                    to: "valid",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  results: {
    draggingPoint(data, event: DragEvent) {
      const { id, info } = event

      const item = data.inventory.contents[id]

      let x = Math.round((info.offset?.x || 0) / 20 + item.point.x)
      let y = Math.round((info.offset?.y || 0) / 20 + item.point.y)

      return { x, y }
    },
    hoveredSlot(data, event: DragEvent, point: DS.Point) {
      let slotId: DS.SlotId | undefined = undefined

      const item = data.inventory.contents[event.id]
      const thing = data.things[item.thing]

      for (let slot of Object.values(data.slots)) {
        if (
          !(
            point.x + thing.size.width / 2 < slot.point.x ||
            point.x + thing.size.width / 2 > slot.point.x + slot.size.width ||
            point.y + thing.size.height / 2 < slot.point.y ||
            point.y + thing.size.height / 2 > slot.point.y + slot.size.height
          )
        ) {
          slotId = slot.id
        }
      }

      return slotId
    },
  },
  conditions: {
    isHoveringSlot(data, event: DragEvent, id: string) {
      return id !== undefined
    },
    isHoveringGrid(data, event: DragEvent, point: DS.Point) {
      const { id } = event

      const item = data.inventory.contents[id]
      const thing = things[item.thing]

      return !(
        point.x < 21 ||
        point.x + thing.size.width > 31 ||
        point.y < 2 ||
        point.y + thing.size.height > 22
      )
    },
    pointIsDraggingItemPoint(data, event: DragEvent, point: DS.Point) {
      const { dragging } = data.inventory

      if (dragging) {
        return dragging.point.x === point.x && dragging.point.y === point.y
      } else {
        return false
      }
    },
    slotIsDraggingItemSlot(data, event: DragEvent, slotId: DS.SlotId) {
      const { dragging } = data.inventory

      if (dragging) {
        return dragging.slot === slotId
      } else {
        return false
      }
    },
    slotIsValid(data, event: DragEvent, slotId: DS.SlotId) {
      const { id } = event
      const item = data.inventory.contents[id]
      const thing = things[item.thing]
      const slot = data.slots[slotId]

      if (!slot) return false

      return (
        (slot.item === undefined || slot.item === item.id) &&
        thing.slots.includes(slotId)
      )
    },
    pointIsValidInGrid(data, event: DragEvent, point: DS.Point) {
      const { id } = event

      const item = data.inventory.contents[id]
      const thing = things[item.thing]

      let valid = true

      for (let x = 0; x < thing.size.width; x++) {
        for (let y = 0; y < thing.size.height; y++) {
          const cx = point.x + x - 21
          const cy = point.y + y - 2

          const cell = data.inventory.cells[cy]?.[cx]

          if (cell === undefined || (cell !== item.id && cell !== ".")) {
            valid = false
            break
          }
        }
      }

      return valid
    },
  },
  actions: {
    addItems(data, items: DS.Item[]) {
      for (let item of items) {
        item.point.x += 21
        item.point.y += 2

        data.inventory.contents[item.id] = item

        const thing = things[item.thing]

        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            const cx = x + item.point.x - 21
            const cy = y + item.point.y - 2
            data.inventory.cells[cy][cx] = item.id
          }
        }
      }
    },
    setDraggingItem(data, event: DragEvent) {
      const item = data.inventory.contents[event.id]
      data.inventory.dragging = cloneDeep(item)
    },
    clearDraggingItem(data, event: DragEvent) {
      data.inventory.dragging = undefined
    },
    updateDraggingItem(data, event: DragEvent, point: DS.Point) {
      const draggingItem = data.inventory.dragging

      if (draggingItem) {
        draggingItem.point = { x: point.x, y: point.y }
      }
    },
    clearDraggingSlot(data) {
      const draggingItem = data.inventory.dragging
      if (draggingItem) {
        draggingItem.slot = undefined
      }
    },
    updateDraggingItemSlot(data, event: DragEvent, slotId: DS.SlotId) {
      const draggingItem = data.inventory.dragging

      if (draggingItem) {
        draggingItem.slot = slotId

        if (slotId) {
          const slot = data.slots[slotId]
          draggingItem.point = { ...slot.point }
        }
      }
    },
    setItemInSlot(data, event: DragEvent, slotId: DS.SlotId) {
      const draggingItem = data.inventory.dragging
      const item = data.inventory.contents[event.id]
      const thing = things[item.thing]

      if (draggingItem) {
        if (item.slot === undefined) {
          for (let x = 0; x < thing.size.width; x++) {
            for (let y = 0; y < thing.size.height; y++) {
              const cx = x + item.point.x - 21
              const cy = y + item.point.y - 2
              data.inventory.cells[cy][cx] = "."
            }
          }
        } else {
          const lastSlot = data.slots[item.slot]
          lastSlot.item = undefined
        }

        const slot = data.slots[slotId]

        item.slot = slot.id
        slot.item = item.id

        item.point = { ...slot.point }
      }
    },
    setItemInGrid(data, event: DragEvent, point: DS.Point) {
      const draggingItem = data.inventory.dragging
      const item = data.inventory.contents[event.id]
      const thing = things[item.thing]

      if (draggingItem) {
        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            const cx = x + item.point.x - 21
            const cy = y + item.point.y - 2
            data.inventory.cells[cy][cx] = "."
          }
        }

        item.point = draggingItem.point

        if (item.slot) {
          const slot = data.slots[item.slot]
          slot.item = undefined
          item.slot = undefined
        }

        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            const cx = x + item.point.x - 21
            const cy = y + item.point.y - 2
            data.inventory.cells[cy][cx] = item.id
          }
        }
      }
    },
    swapItem(data, event: DragEvent) {
      const { id } = event
      const item = data.inventory.contents[id]
      const thing = things[item.thing]

      if (item.slot) {
        const slot = data.slots[item.slot]

        // Move to inventory (if it fits)
        for (let y = 0; y <= 20 - thing.size.height; y++) {
          for (let x = 0; x <= 10 - thing.size.width; x++) {
            let open = true

            // Can the item fit here?
            for (let y1 = 0; y1 < thing.size.height; y1++) {
              for (let x1 = 0; x1 < thing.size.width; x1++) {
                const cx = x + x1
                const cy = y + y1

                if (open) {
                  if (data.inventory.cells[cy][cx] !== ".") {
                    open = false
                  }
                }
              }
            }

            if (open) {
              slot.item = undefined
              item.slot = undefined

              item.point.x = x + 21
              item.point.y = y + 2

              for (let y1 = 0; y1 < thing.size.height; y1++) {
                for (let x1 = 0; x1 < thing.size.width; x1++) {
                  const cx = x + x1
                  const cy = y + y1

                  data.inventory.cells[cy][cx] = item.id
                }
              }

              return
            }
          }
        }
      } else {
        // Move to slots (if one is open)
        for (let slot of Object.values(data.slots)) {
          if (slot.item === undefined && thing.slots.includes(slot.id)) {
            for (let x = 0; x < thing.size.width; x++) {
              for (let y = 0; y < thing.size.height; y++) {
                const cx = x + item.point.x - 21
                const cy = y + item.point.y - 2
                data.inventory.cells[cy][cx] = "."
              }
            }

            item.slot = slot.id
            slot.item = item.id

            item.point = { ...slot.point }

            return
          }
        }
      }
    },
  },
})

game.send("ADD_ITEMS", [
  {
    id: uniqueId(),
    thing: DS.ThingId.Hoodie,
    point: { x: 0, y: 0 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.TShirt,
    point: { x: 4, y: 10 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.Knife,
    point: { x: 6, y: 3 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.Hatchet,
    point: { x: 0, y: 6 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.Binoculars,
    point: { x: 1, y: 10 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.Hat,
    point: { x: 1, y: 16 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.Compass,
    point: { x: 0, y: 14 },
  },
  {
    id: uniqueId(),
    thing: DS.ThingId.SwissArmyKnife,
    point: { x: 5, y: 16 },
  },
])

export default game
