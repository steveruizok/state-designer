import { uniqueId } from "lodash-es"
import { createStateDesignerConfig } from "state-designer"

type Item = {
  id: string
  clean: {
    value: string
  }
  dirty: {
    value: string
  }
  editing: boolean
}

export const ListConfig = createStateDesignerConfig({
  data: {
    items: [
      {
        id: uniqueId(),
        clean: {
          value: "Hello world"
        },
        dirty: {
          value: "Hello world"
        },
        editing: false
      }
    ] as Item[]
  },
  on: {
    ADD_ITEM: {
      do: "addItem"
    },
    REMOVE_ITEM: {
      get: "itemIndex",
      do: "removeItem"
    },
    MOVE_ITEM: {
      get: "itemIndex",
      if: "canMoveItem",
      do: "moveItem"
    },
    UPDATE_ITEM: {
      get: "item",
      do: "updateItem"
    },
    EDIT_ITEM: {
      get: "item",
      do: "startEditingItem"
    },
    SAVE_ITEM_EDIT: {
      get: "item",
      do: ["saveEditingItem", "stopEditingItem"]
    },
    CANCEL_ITEM_EDIT: {
      get: "item",
      do: "stopEditingItem"
    }
  },
  results: {
    item: (data, { id }) => data.items.find(item => item.id === id),
    itemIndex: (data, { id }) => data.items.findIndex(item => item.id === id),
    newItem: () => ({
      id: uniqueId(),
      clean: {
        value: "Hello world"
      },
      dirty: {
        value: "Hello world"
      },
      editing: false
    })
  },
  actions: {
    // Items
    addItem: (data, payload, newItem) => data.items.push(newItem),
    moveItem: (data, { delta }, index) => {
      const t = data.items[index]
      data.items[index] = data.items[index + delta]
      data.items[index + delta] = t
    },
    removeItem: (data, payload, index: number) => {
      data.items.splice(index, 1)
    },
    updateItem: (data, { value }, item: Item) => {
      item.dirty.value = value
    },
    saveEditingItem: (data, payload, item: Item) => {
      item.clean.value = item.dirty.value
    },
    stopEditingItem: (data, payload, item: Item) => {
      item.dirty.value = item.clean.value
      item.editing = false
    },
    startEditingItem: (data, payload, item: Item) => {
      item.dirty.value = item.clean.value
      item.editing = true
    }
  },
  conditions: {
    // Items
    canMoveItem: (data, { delta }, index) =>
      !(delta + index < 0 || delta + index > data.items.length - 1),
    valueIsValid: (data, payload, item) => item.dirty.value.length > 3
  }
})
