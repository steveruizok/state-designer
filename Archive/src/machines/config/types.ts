import {
  StateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

/* -------------------------------------------------- */
/*                        Types                       */
/* -------------------------------------------------- */

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

// Generic

export interface EditableItem<T, K = Omit<T, "id">> {
  id: string
  clean: K
  dirty: K
}

// Event Handler

export interface NamedFunction {
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

/* -------------------------------------------------- */
/*                   Configurations                   */
/* -------------------------------------------------- */

export type OldConfigData = {
  events: EditableItem<EventHandler>[]
  states: EditableItem<State>[]
  namedFunctions: {
    actions: EditableItem<NamedAction>[]
    conditions: EditableItem<NamedCondition>[]
    results: EditableItem<NamedResult>[]
    values: EditableItem<NamedValue>[]
  }
}

export interface NamedFunctionData {
  id: string
  editing: boolean
  dirty: NamedFunction
  clean: NamedFunction
}

const namedFunctionData = createStateDesignerData<NamedFunctionData>({
  id: "0",
  editing: false,
  dirty: {
    name: "increment",
    code: "data.count++"
  },
  clean: {
    name: "increment",
    code: "data.count++"
  }
})

const namedFunctionConfig = createStateDesignerConfig({
  data: namedFunctionData,
  on: {
    UPDATE_ITEM: {
      do: "updateName"
    },
    EDIT_ITEM: {
      do: "startEditing"
    },
    SAVE_ITEM_EDIT: {
      do: ["saveEdits", "stopEditing"]
    },
    CANCEL_ITEM_EDIT: {
      do: "stopEditing"
    }
  },
  actions: {
    updateName: (data, { name }) => {
      data.dirty.name = name
    },
    updateCode: (data, { code }) => {
      data.dirty.code = code
    },
    saveEdits: data => {
      data.clean = data.dirty
    },
    stopEditing: data => {
      data.dirty = data.clean
      data.editing = false
    },
    startEditing: data => {
      data.dirty = data.clean
      data.editing = true
    }
  },
  conditions: {
    nameIsValid: data => true,
    codeIsValid: data => true
  }
})

const namedFunctionStateDesigner = new StateDesigner(namedFunctionConfig)

interface NamedFunctionListData {
  items: typeof namedFunctionStateDesigner[]
}

const namedFunctionListConfig = createStateDesignerConfig({
  data: {
    items: []
  } as NamedFunctionListData,
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
    }
  },
  results: {
    item: (data, { id }) => data.items.find(item => item.data.id === id),
    itemIndex: (data, { id }) =>
      data.items.findIndex(item => item.data.id === id),
    newItem: () => new StateDesigner(namedFunctionConfig)
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

export const NamedFunctionList = new StateDesigner(namedFunctionListConfig)
