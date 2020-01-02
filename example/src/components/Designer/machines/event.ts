import { uniqueId, cloneDeep } from "lodash-es"
import {
  StateDesigner,
  createStateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import * as DS from "../types"

type EventData = {
  id: string
  editing: boolean
  clean: DS.Event
  dirty: DS.Event
}

export const createEventConfig = (data: EventData) =>
  createStateDesignerConfig({
    data,
    on: {
      UPDATE_NAME: "updateName",
      EDIT_EVENT: "startEditingEvent",
      SAVE_EVENT_EDIT: {
        if: ["nameIsValid", "codeIsValid"],
        do: ["saveEventChanges", "stopEditingEvent"]
      },
      CANCEL_EVENT_EDIT: "stopEditingEvent",
      CREATE_EVENT_HANDLER: {
        get: "newEventHandler",
        do: "addEventHandler"
      },
      DUPLICATE_EVENT_HANDLER: {
        get: ["handlers", "handler"],
        do: "duplicateEventHandler"
      },
      MOVE_EVENT_HANDLER: {
        get: ["handlers", "handlerIndex"],
        if: "canMoveEventHandler",
        do: "moveEventHandler"
      },
      REMOVE_EVENT_HANDLER: {
        get: ["handlers", "handlerIndex"],
        do: "removeEventHandler"
      },
      CREATE_HANDLER_ACTION: {
        get: ["handler", "actions"],
        do: "createHandlerItem"
      },
      UPDATE_HANDLER_ACTION: {
        get: ["handler", "actions", "action"],
        if: ["nameIsValid"],
        do: ["updateHandlerItem", "updateHandlerError"]
      },
      MOVE_HANDLER_ACTION: {
        get: ["handler", "actions"],
        if: "canMoveHandlerItem",
        do: "moveHandlerItem"
      },
      REMOVE_HANDLER_ACTION: {
        get: ["handler", "actions"],
        do: "removeHandlerItem"
      },
      CREATE_HANDLER_CONDITION: {
        get: ["handler", "conditions"],
        do: "createHandlerItem"
      },
      UPDATE_HANDLER_CONDITION: {
        get: ["handler", "conditions", "condition"],
        if: ["nameIsValid"],
        do: ["updateHandlerItem", "updateHandlerError"]
      },
      MOVE_HANDLER_CONDITION: {
        get: ["handler", "conditions"],
        if: "canMoveHandlerItem",
        do: "moveHandlerItem"
      },
      REMOVE_HANDLER_CONDITION: {
        get: ["handler", "conditions"],
        do: "removeHandlerItem"
      },
      CREATE_HANDLER_RESULT: {
        get: ["handler", "results"],
        do: "createHandlerItem"
      },
      UPDATE_HANDLER_RESULT: {
        get: ["handler", "results", "result"],
        if: ["nameIsValid"],
        do: ["updateHandlerItem", "updateHandlerError"]
      },
      MOVE_HANDLER_RESULT: {
        get: ["handler", "results"],
        if: "canMoveHandlerItem",
        do: "moveHandlerItem"
      },
      REMOVE_HANDLER_RESULT: {
        get: ["handler", "results"],
        do: "removeHandlerItem"
      }
    },
    results: {
      newEventHandler: () => {
        return {
          id: uniqueId(),
          get: [],
          if: [],
          do: []
        }
      },
      handler: (data, { handlerId }) =>
        data.dirty.handlers.find(h => h.id === handlerId),
      handlers: data => data.dirty.handlers,
      handlerIndex: (data, { id }, handlers: DS.Handler[]) =>
        handlers.findIndex(item => item.id === id),
      actions: (d, p, handler: DS.Handler) => handler.do,
      conditions: (d, p, handler: DS.Handler) => handler.if,
      results: (d, p, handler: DS.Handler) => handler.get,
      action: (d, { id }, actions: DS.HandlerItem[]) =>
        actions.find(h => h.id === id),
      result: (d, { id }, results: DS.HandlerItem[]) =>
        results.find(h => h.id === id),
      condition: (d, { id }, conditions: DS.HandlerItem[]) =>
        conditions.find(h => h.id === id)
    },
    actions: {
      startEditingEvent: data => {
        data.dirty = data.clean
        data.editing = true
      },
      stopEditingEvent: data => {
        data.editing = false
      },
      saveEventChanges: data => {
        data.clean = data.dirty
      },
      addEventHandler: (data, p, eventHandler) => {
        data.dirty.handlers.push(eventHandler)
      },
      duplicateEventHandler: (data, { id }) => {
        const e = data.dirty.handlers.find(h => h.id === id)
        if (!e) return

        const t = cloneDeep(e)
        t.id = uniqueId()

        data.dirty.handlers.push(t)
      },
      moveEventHandler: (data, { target }, index) => {
        const t = data.dirty.handlers.splice(index, 1)[0]
        data.dirty.handlers.splice(target, 1, t)
      },
      removeEventHandler: (data, payload, index: number) => {
        data.dirty.handlers.splice(index, 1)
      },
      updateName: (data, { name }) => {
        data.dirty.name = name
      },
      createHandlerItem: (
        d,
        { mustReturn },
        handlerItems: DS.HandlerItem[]
      ) => {
        handlerItems.push({
          id: uniqueId(),
          type: DS.HandlerItems.Custom,
          name: undefined,
          code: mustReturn ? "return " : "",
          mustReturn
        })
      },
      updateHandlerItem: (d, { name, code }, handlerItem: DS.HandlerItem) => {
        handlerItem.name = name === "custom" ? undefined : name
        handlerItem.type =
          name === "custom" ? DS.HandlerItems.Custom : DS.HandlerItems.Named
        handlerItem.code = code
      },
      moveHandlerItem: (
        data,
        { id, target },
        handlerItems: DS.HandlerItem[]
      ) => {
        const index = handlerItems.findIndex(v => v.id === id)
        const t = handlerItems.splice(index, 1)[0]
        handlerItems.splice(target, 0, t)
        // const t = handlerItems[index]
        // handlerItems[index] = handlerItems[index + delta]
        // handlerItems[index + delta] = t
      },
      updateHandlerError: (d, { code }, handlerItem: DS.HandlerItem) => {
        try {
          new Function("data", "payload", "result", code)
        } catch (e) {
          return (handlerItem.error = e.message)
        }

        if (
          handlerItem.mustReturn &&
          handlerItem.code !== undefined &&
          !handlerItem.code.includes("return")
        ) {
          handlerItem.error = "Must return a value."
        } else {
          handlerItem.error = undefined
        }
      },
      removeHandlerItem: (d, { id }, handlerItems: DS.HandlerItem[]) => {
        const index = handlerItems.findIndex(h => h.id === id)
        handlerItems.splice(index, 1)
      }
    },
    conditions: {
      nameIsValid: data => {
        const { name } = data.dirty
        try {
          new Function("data", "payload", "result", `const v = ${name}`)
          return true
        } catch (e) {
          return false
        }
      },
      codeIsValid: data => {
        const { handlers } = data.dirty
        return handlers.every(
          handler =>
            handler.do.every(item => item.error === undefined) &&
            handler.if.every(item => item.error === undefined)
        )
      },
      canMoveEventHandler: (data, { target }) =>
        !(target < 0 || target > data.dirty.handlers.length - 1),
      canMoveHandlerItem: (
        data,
        { id, target },
        handlerItems: DS.HandlerItem[]
      ) => {
        const index = handlerItems.findIndex(h => h.id === id)
        return !(target < 0 || target > handlerItems.length - 1)
      }
    }
  })

export const emptyEventConfig = createEventConfig({
  id: uniqueId(),
  editing: true,
  clean: {
    id: uniqueId(),
    name: "",
    payload: "",
    handlers: [
      {
        id: uniqueId(),
        get: [],
        if: [],
        do: []
      }
    ]
  },
  dirty: {
    id: uniqueId(),
    name: "",
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
})

export const defaultEventConfig = createEventConfig({
  id: uniqueId(),
  editing: false,
  clean: {
    id: uniqueId(),
    name: "INCREMENT",
    payload: "",
    handlers: [
      {
        id: uniqueId(),
        get: [],
        if: [
          {
            id: uniqueId(),
            type: DS.HandlerItems.Custom,
            name: undefined,
            code: "return data.count < 10",
            mustReturn: true
          }
        ],
        do: [
          {
            id: uniqueId(),
            type: DS.HandlerItems.Custom,
            name: undefined,
            code: "data.count++",
            mustReturn: false
          }
        ]
      }
    ]
  },
  dirty: {
    id: uniqueId(),
    name: "INCREMENT",
    payload: "",
    handlers: [
      {
        id: uniqueId(),
        get: [],
        if: [
          {
            id: uniqueId(),
            type: DS.HandlerItems.Custom,
            name: undefined,
            code: "return data.count < 10",
            mustReturn: true
          }
        ],
        do: [
          {
            id: uniqueId(),
            type: DS.HandlerItems.Custom,
            name: undefined,
            code: "data.count++",
            mustReturn: false
          }
        ]
      }
    ]
  }
})

export type EventConfig = ReturnType<typeof createEventConfig>
