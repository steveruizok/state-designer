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

        STOPPED_DRAGGING_ITEM: [
          {
            get: "draggingPoint",
            if: "pointIsValid",
            do: ["updateDraggingItem", "setItemPoint"],
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
                unless: "pointIsValid",
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
                if: "pointIsValid",
                to: "valid",
              },
            ],
          },
        },
      },
    },
  },
  results: {
    draggingPoint(data, event: DragEvent) {
      const { id, info } = event

      const item = data.inventory.contents[id]
      const thing = things[item.thing]

      let x = Math.round(info.offset.x / 20 + item.point.x)
      let y = Math.round(info.offset.y / 20 + item.point.y)

      x = Math.max(Math.min(x, 10 - thing.size.width), 0)
      y = Math.max(Math.min(y, 20 - thing.size.height), 0)

      return { x, y }
    },
  },
  conditions: {
    pointIsDraggingItemPoint(data, event: DragEvent, point: DS.Point) {
      const { dragging } = data.inventory

      if (dragging) {
        return dragging.point.x === point.x && dragging.point.y === point.y
      } else {
        return false
      }
    },
    pointIsValid(data, event: DragEvent, point: DS.Point) {
      const { id } = event

      const item = data.inventory.contents[id]
      const thing = things[item.thing]

      let valid = true

      for (let x = 0; x < thing.size.width; x++) {
        for (let y = 0; y < thing.size.height; y++) {
          const px = point.x + x
          const py = point.y + y
          const cell = data.inventory.cells[py][px]

          if (cell !== item.id && cell !== ".") {
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
        data.inventory.contents[item.id] = item

        const thing = things[item.thing]

        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            data.inventory.cells[y + item.point.y][x + item.point.x] = item.id
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
        draggingItem.point = point
      }
    },
    setItemPoint(data, event: DragEvent, point: DS.Point) {
      const draggingItem = data.inventory.dragging
      const item = data.inventory.contents[event.id]
      const thing = things[item.thing]

      if (draggingItem) {
        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            data.inventory.cells[y + item.point.y][x + item.point.x] = "."
          }
        }

        item.point = draggingItem.point

        for (let x = 0; x < thing.size.width; x++) {
          for (let y = 0; y < thing.size.height; y++) {
            data.inventory.cells[y + item.point.y][x + item.point.x] = item.id
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
])

export default game
