import { uniqueId, pull } from "lodash-es"
import { StateDesigner, createStateDesignerConfig } from "state-designer"
import { createNamedFunctionConfig, NamedFunctionConfig } from "./namedFunction"

export interface NamedFunctionListData {
  items: {
    id: string
    item: StateDesigner<NamedFunctionConfig>
  }[]
}

const initialActionListData: NamedFunctionListData = {
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
            name: "increment",
            code: "data.count++",
            mustReturn: false
          },
          clean: {
            name: "increment",
            code: "data.count++",
            mustReturn: false
          }
        })
      )
    },
    {
      id: uniqueId(),
      item: new StateDesigner(
        createNamedFunctionConfig({
          id: uniqueId(),
          editing: false,
          hasChanges: false,
          error: undefined,
          dirty: {
            name: "decrement",
            code: "data.count--",
            mustReturn: false
          },
          clean: {
            name: "decrement",
            code: "data.count--",
            mustReturn: false
          }
        })
      )
    }
  ]
}

const defaultActionListData: NamedFunctionListData = {
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
            mustReturn: false
          },
          clean: {
            name: "",
            code: "",
            mustReturn: false
          }
        })
      )
    }
  ]
}

export const createActionListConfig = (data: NamedFunctionListData) =>
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
              mustReturn: false
            },
            clean: {
              name: "",
              code: "",
              mustReturn: false
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

export const getInitialActionListConfig = () =>
  createActionListConfig(initialActionListData)

export const getDefaultActionListConfig = () =>
  createActionListConfig(defaultActionListData)

export type ActionListConfig = ReturnType<typeof createActionListConfig>
