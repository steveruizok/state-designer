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
  mustReturn: boolean
}

export interface NamedAction extends NamedFunction {
  type: NamedFunctions.Action
  mustReturn: false
}

export interface NamedCondition extends NamedFunction {
  type: NamedFunctions.Condition
  mustReturn: true
}

export interface NamedResult extends NamedFunction {
  type: NamedFunctions.Result
  mustReturn: true
}

export interface NamedValue extends NamedFunction {
  type: NamedFunctions.Value
  mustReturn: true
}

export interface NamedItem {
  id: string
  type: HandlerItems
  name: string
  code: undefined
  mustReturn: boolean
  error?: string
}

export interface CustomItem {
  id: string
  type: HandlerItems
  name: undefined
  code: string
  mustReturn: boolean
  error?: string
}

export type HandlerItem = NamedItem | CustomItem

export type Handler = {
  id: string
  do: HandlerItem[]
  if: HandlerItem[]
  get: HandlerItem[]
}

export type Event = {
  id: string
  name: string
  payload: string
  handlers: Handler[]
}

export type State = {
  id: string
  name: string
  events: Event[]
}
