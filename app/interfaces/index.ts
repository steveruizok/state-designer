// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

/* -------------------------------------------------- */
/*                        Types                       */
/* -------------------------------------------------- */

export enum HandlerItems {
  Custom = "custom",
  Named = "named"
}

export enum NamedFunctions {
  Async = "async",
  Transition = "transition",
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

// Event Handler Callbacks

export interface EventHandlerCallback {
  index: number
  id: string
  custom: boolean
  type: NamedFunctions
  name: string
  code: string
  mustReturn: boolean
  returnType?: string
  error?: string
  handlers: string[]
}

// Several different types of event handler callbacks

export interface Transition extends EventHandlerCallback {
  type: NamedFunctions.Transition
  mustReturn: true
  returnType: "string"
}

export interface Action extends EventHandlerCallback {
  type: NamedFunctions.Action
  mustReturn: false
}

export interface Condition extends EventHandlerCallback {
  type: NamedFunctions.Condition
  mustReturn: true
  returnType: "boolean"
}

export interface Result extends EventHandlerCallback {
  type: NamedFunctions.Result
  mustReturn: true
}

export interface Value extends EventHandlerCallback {
  type: NamedFunctions.Value
  mustReturn: true
}

export type AsyncEventHandlerCallback<T = any> = {
  index: number
  id: string
  name: string
  type: NamedFunctions.Async
  get: () => Promise<T>
  then: string[]
  catch: string[]
}

// Async components are different

export type EventHandler = {
  index: number
  id: string
  to?: string
  do: { id: string; ref: string }[]
  if: string[]
  unless: string[]
  ifAny: string[]
  get: string[]
  wait?: number
  await: string[]
}

export type Event = {
  index: number
  id: string
  name: string
  payload: string
  handlers: string[]
}

export interface State {
  index: number
  id: string
  name: string
  events: string[]
  parent?: State
  states: string[]
}
