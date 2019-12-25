import { uniqueId } from "lodash-es"
import { createStateDesignerConfig } from "state-designer"

export enum HandlerItems {
  Custom = "custom",
  Named = "named"
}

export enum NamedFunctions {
  Action = "action",
  Condition = "condition",
  Result = "result",
  Value = "value"
}

const createEditorData = (options: ConfigState) => {
  return options
}

const editorData = createEditorData({
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
                type: HandlerItems.Custom,
                id: uniqueId(),
                name: undefined,
                code: "count > 0"
              }
            ],
            do: [
              {
                id: uniqueId(),
                type: HandlerItems.Custom,
                name: undefined,
                code: `console.log("hello world")`
              },
              {
                id: uniqueId(),
                type: HandlerItems.Named,
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
          type: NamedFunctions.Action,
          name: "increment",
          code: "data.count++"
        },
        clean: {
          type: NamedFunctions.Action,
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
})

/* -------------------------------------------------- */
/*                        Types                       */
/* -------------------------------------------------- */

// Generic

export interface EditableItem<T, K = Omit<T, "id">> {
  id: string
  clean: K
  dirty: K
  editing: boolean
}

// Event Handler

export interface NamedFunction {
  id: string
  name: string
  code: string
}

export interface NamedAction extends NamedFunction {
  type: NamedFunctions.Action
}

export interface NamedCondition extends NamedFunction {
  type: NamedFunctions.Condition
}

export interface NamedResult extends NamedFunction {
  type: NamedFunctions.Result
}

export interface NamedValue extends NamedFunction {
  type: NamedFunctions.Value
}

export interface NamedItem {
  id: string
  type: HandlerItems
  name: string
  code: undefined
}

export interface CustomItem {
  id: string
  type: HandlerItems
  name: undefined
  code: string
}

export type Handler = {
  id: string
  do: (NamedItem | CustomItem)[]
  if: (NamedItem | CustomItem)[]
  get: (NamedItem | CustomItem)[]
}

export type EventHandler = {
  id: string
  name: string
  payload: string
  handlers: Handler[]
}

export type State = {
  id: string
  name: string
  events: EventHandler[]
}

export type ConfigState = {
  events: EditableItem<EventHandler>[]
  states: EditableItem<State>[]
  namedFunctions: {
    actions: EditableItem<NamedAction>[]
    conditions: EditableItem<NamedCondition>[]
    results: EditableItem<NamedResult>[]
    values: EditableItem<NamedValue>[]
  }
}
