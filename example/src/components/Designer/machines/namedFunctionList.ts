import { uniqueId } from "lodash-es"
import { StateDesigner, createStateDesignerConfig } from "state-designer"
import { namedFunctionConfig, NamedFunctionConfig } from "./namedFunction"

export interface NamedFunctionListData {
  items: {
    id: string
    item: StateDesigner<NamedFunctionConfig>
  }[]
}

const namedFunctionListData: NamedFunctionListData = {
  items: [{ id: uniqueId(), item: new StateDesigner(namedFunctionConfig) }]
}

export const namedFunctionListConfig = createStateDesignerConfig({
  data: namedFunctionListData,
  on: {
    CREATE_ITEM: {
      get: "newItem",
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
    }
  },
  results: {
    item: (data, { id }) => data.items.find(item => item.id === id),
    itemIndex: (data, { id }) => data.items.findIndex(item => item.id === id),
    newItem: () => ({
      id: uniqueId(),
      item: new StateDesigner(namedFunctionConfig)
    })
  },
  actions: {
    addItem: (data, payload, newItem) => data.items.push(newItem),
    moveItem: (data, { delta }, index) => {
      const t = data.items[index]
      data.items[index] = data.items[index + delta]
      data.items[index + delta] = t
    },
    removeItem: (data, payload, index: number) => {
      data.items.splice(index, 1)
    }
  },
  conditions: {
    canMoveItem: (data, { delta }, index) =>
      !(delta + index < 0 || delta + index > data.items.length - 1)
  }
})

export type NamedFunctionListConfig = typeof namedFunctionListConfig
