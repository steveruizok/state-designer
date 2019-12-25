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
