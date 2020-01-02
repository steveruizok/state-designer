import { uniqueId } from "lodash-es"
import { StateDesigner, createStateDesignerConfig } from "state-designer"
import { createNamedFunctionConfig, NamedFunctionConfig } from "./namedFunction"

export interface NamedFunctionListData {
  items: {
    id: string
    item: StateDesigner<NamedFunctionConfig>
  }[]
}

const initialConditionListData: NamedFunctionListData = {
  items: [
    {
      id: uniqueId(),
      item: new StateDesigner(
        createNamedFunctionConfig({
          id: uniqueId(),
          editing: false,
          hasChanges: false,
          error: undefined,
          dirty: {
            name: "underMax",
            code: "return data.count < 10",
            mustReturn: true
          },
          clean: {
            name: "underMax",
            code: "return data.count < 10",
            mustReturn: true
          }
        })
      )
    }
  ]
}

const defaultConditionListData: NamedFunctionListData = {
  items: [
    {
      id: uniqueId(),
      item: new StateDesigner(
        createNamedFunctionConfig({
          id: uniqueId(),
          editing: false,
          hasChanges: false,
          error: undefined,
          dirty: {
            name: "",
            code: "",
            mustReturn: true
          },
          clean: {
            name: "",
            code: "",
            mustReturn: true
          }
        })
      )
    }
  ]
}

export const createConditionListConfig = (data: NamedFunctionListData) =>
  createStateDesignerConfig({
    data,
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
        item: new StateDesigner(
          createNamedFunctionConfig({
            id: uniqueId(),
            editing: false,
            hasChanges: false,
            error: undefined,
            dirty: {
              name: "",
              code: "",
              mustReturn: true
            },
            clean: {
              name: "",
              code: "",
              mustReturn: true
            }
          })
        )
      })
    },
    actions: {
      addItem: (data, payload, newItem) => data.items.push(newItem),
      moveItem: (data, { target }, index) => {
        const item = data.items.splice(index, 1)[0]
        data.items.splice(target, 0, item)
      },
      removeItem: (data, payload, index: number) => {
        data.items.splice(index, 1)
      }
    },
    conditions: {
      canMoveItem: (data, { target }) =>
        !(target < 0 || target > data.items.length - 1)
    }
  })

export const getInitialConditionListConfig = () =>
  createConditionListConfig(initialConditionListData)
export const getDefaultConditionListConfig = () =>
  createConditionListConfig(defaultConditionListData)

export type ConditionListConfig = ReturnType<typeof createConditionListConfig>
