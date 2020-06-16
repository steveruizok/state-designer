export type Id<T extends { id: string }> = T["id"]

export interface EventFunction {
  id: string
  index: number
  name: string
  code: string
}

export interface Action extends EventFunction {}

export interface Condition extends EventFunction {}

export interface Result extends EventFunction {}

export interface Time extends EventFunction {}

export interface Value extends EventFunction {}

export type SendEvent = {
  id: string
  index: number
  name: string
}

export type StateBranch = {
  state: StateNode
  isInitial: boolean
  isFirst: boolean
  isLast: boolean
  descendants?: StateBranch[]
}

export type EventHandler = {
  id: string
  index: number
  event: string // id
  chain: Map<string, HandlerLink>
}

export enum TransitionType {
  Normal = "normal",
  Previous = "previous",
  Restore = "restore",
}

export type HandlerLink = {
  id: string
  index: number
  to?: Id<StateNode> // state id
  do: Id<Action>[] // action id
  if: Id<Condition>[] // condition id
  transitionType: TransitionType
}

export type StateNode = {
  id: string
  index: number
  parent?: Id<StateNode>
  depth: number
  name: string
  eventHandlers: Map<string, EventHandler>
  initial?: Id<StateNode>
  states: Set<string>
}
