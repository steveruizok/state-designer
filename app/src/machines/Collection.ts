import { StateDesigner } from "state-designer"
import uniqueId from "lodash/uniqueId"
import sortBy from "lodash/sortBy"

export function createCollection<T extends { id: string; index: number }>(
  getNewItem: (id: string) => T
) {
  const item = getNewItem("initial")
  item.index = 0

  return new StateDesigner({
    data: new Map([[item.id, item]]) as Map<string, T>,
    on: {
      CREATE: {
        get: "newItem",
        do: "addItem"
      },
      REMOVE: {
        do: "removeItem"
      },
      EDIT: {
        get: "item",
        do: "editItem"
      },
      MOVE: {
        get: "item",
        do: "moveItem"
      }
    },
    results: {
      newItem: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const item = getNewItem(id)
        item.index = data.size
        return item
      },
      item: (data, { id }) => data.get(id)
    },
    actions: {
      addItem(data, _, item: T) {
        data.set(item.id, item)
      },
      removeItem(data, { id }) {
        data.delete(id)
      },
      editItem(_, { changes }, item: T) {
        Object.assign(item, changes)
      },
      moveItem(data, { target }, item: T) {
        if (target === item.index) return

        const items = sortBy(Array.from(data.values()), "index")

        for (let o of items) {
          if (o === item) continue

          if (target < item.index) {
            if (o.index >= target && o.index < item.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > item.index) {
              o.index--
            }
          }
        }

        item.index = target
      }
    },
    conditions: {}
  })
}
