import { uniqueId } from "lodash-es"
import { ValuesType } from "utility-types"
import {
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"
import * as DS from "./types"

const editorData = createStateDesignerData({
  events: [
    {
      id: uniqueId(),
      editing: false,
      clean: {
        name: "INCREMENT",
        payload: "",
        handlers: []
      },
      dirty: {
        name: "INCREMENT",
        payload: "",
        handlers: [
          {
            id: uniqueId(),
            if: [
              {
                type: DS.HandlerItems.Custom,
                id: uniqueId(),
                name: undefined,
                code: "count > 0"
              }
            ],
            do: [
              {
                id: uniqueId(),
                type: DS.HandlerItems.Custom,
                name: undefined,
                code: `console.log("hello world")`
              },
              {
                id: uniqueId(),
                type: DS.HandlerItems.Named,
                name: "increment",
                code: undefined
              }
            ],
            get: []
          }
        ]
      }
    }
  ],
  states: [
    {
      id: uniqueId(),
      editing: false,
      dirty: {
        name: "Inactive",
        events: []
      },
      clean: {
        name: "Inactive",
        events: [
          {
            id: uniqueId(),
            name: "TURN_ON",
            payload: "",
            handlers: [
              {
                id: uniqueId(),
                get: [],
                if: [],
                do: []
              }
            ]
          }
        ]
      }
    },
    {
      id: uniqueId(),
      editing: false,
      dirty: {
        name: "Active",
        events: []
      },
      clean: {
        name: "Active",
        events: []
      }
    }
  ],
  namedFunctions: {
    actions: [
      {
        id: uniqueId(),
        editing: false,
        dirty: {
          type: DS.NamedFunctions.Action,
          name: "increment",
          code: "data.count++"
        },
        clean: {
          type: DS.NamedFunctions.Action,
          name: "increment",
          code: "data.count++"
        }
      }
    ],
    conditions: [],
    results: [],
    values: []
  }
})

export const DesignerConfig = createStateDesignerConfig({
  data: editorData
  // on: {
  //   ADD_ITEM: {
  //     do: "addItem"
  //   },
  //   REMOVE_ITEM: {
  //     get: "itemIndex",
  //     do: "removeItem"
  //   },
  //   UPDATE_ITEM: {
  //     get: "item",
  //     do: "updateItem"
  //   },
  //   EDIT_ITEM: {
  //     get: "item",
  //     do: "startEditingItem"
  //   },
  //   MOVE_ITEM: {
  //     get: "itemIndex",
  //     if: "canMoveItem",
  //     do: "moveItem"
  //   },
  //   SAVE_ITEM_EDIT: {
  //     get: "item",
  //     do: ["saveEditingItem", "stopEditingItem"]
  //   },
  //   CANCEL_ITEM_EDIT: {
  //     get: "item",
  //     do: "stopEditingItem"
  //   }
  // },
  // results: {
  //   item: (data, { id }) => data.items.find(item => item.id === id),
  //   itemIndex: (data, { id }) => data.items.findIndex(item => item.id === id)
  // },
  // actions: {
  //   // Events
  //   addEvent: data =>
  //     data.items.push({
  //       id: uniqueId(),
  //       clean: {
  //         value: "Hello world"
  //       },
  //       dirty: {
  //         value: "Hello world"
  //       },
  //       editing: false
  //     }),
  //   moveEvent: (data, { delta }, index) => {
  //     const t = data.items[index]
  //     data.items[index] = data.items[index + delta]
  //     data.items[index + delta] = t
  //   },
  //   removeEvent: (data, payload, index: number) => {
  //     data.items.splice(index, 1)
  //   },
  //   updateEvent: (data, { value }, item: Item) => {
  //     item.dirty.value = value
  //   },
  //   saveEditingEvent: (data, payload, item: Item) => {
  //     item.clean.value = item.dirty.value
  //   },
  //   stopEditingEvent: (data, payload, item: Item) => {
  //     item.dirty.value = item.clean.value
  //     item.editing = false
  //   },
  //   startEditingEvent: (data, payload, item: Item) => {
  //     item.dirty.value = item.clean.value
  //     item.editing = true
  //   },
  //   // Items
  //   addItem: data =>
  //     data.items.push({
  //       id: uniqueId(),
  //       clean: {
  //         value: "Hello world"
  //       },
  //       dirty: {
  //         value: "Hello world"
  //       },
  //       editing: false
  //     }),
  //   moveItem: (data, { delta }, index) => {
  //     const t = data.items[index]
  //     data.items[index] = data.items[index + delta]
  //     data.items[index + delta] = t
  //   },
  //   removeItem: (data, payload, index: number) => {
  //     data.items.splice(index, 1)
  //   },
  //   updateItem: (data, { value }, item: Item) => {
  //     item.dirty.value = value
  //   },
  //   saveEditingItem: (data, payload, item: Item) => {
  //     item.clean.value = item.dirty.value
  //   },
  //   stopEditingItem: (data, payload, item: Item) => {
  //     item.dirty.value = item.clean.value
  //     item.editing = false
  //   },
  //   startEditingItem: (data, payload, item: Item) => {
  //     item.dirty.value = item.clean.value
  //     item.editing = true
  //   }
  // },
  // conditions: {
  //   // Items
  //   canMoveItem: (data, { delta }, index) =>
  //     !(delta + index < 0 || delta + index > data.items.length - 1),
  //   valueIsValid: (data, payload, item) => item.dirty.value.length > 3
  // }
})
