import {
  StateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import { uniqueId, pullAt } from "lodash-es"

import {
  namedFunctionConfig,
  NamedFunctionStateDesigner
} from "./namedFunction"

interface NamedFunctionListData {
  items: {
    id: string
    item: NamedFunctionStateDesigner
  }[]
}

const namedFunctionListData = createStateDesignerData<NamedFunctionListData>({
  items: [{ id: uniqueId(), item: new StateDesigner(namedFunctionConfig) }]
})

const namedFunctionListConfig = createStateDesignerConfig({
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

export const namedFunctionList = new StateDesigner(namedFunctionListConfig)
