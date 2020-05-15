export type MaybeArray<T> = T | T[]

// Event Functions

export type EventFn<D, T> = (data: D, payload?: any, result?: any) => T

export type EventFnConfig<T, K> = Extract<keyof T, string> | K

// Action

export type Action<D> = EventFn<D, any>

export type ActionConfig<D, T> = EventFnConfig<T, Action<D>>

// Condition

export type Condition<D> = EventFn<D, boolean>

export type ConditionConfig<D, T> = EventFnConfig<T, Condition<D>>

// Result

export type Result<D> = EventFn<D, any>

export type ResultConfig<D, T> = EventFnConfig<T, Result<D>>

// Async

export type Async<D> = EventFn<D, Promise<any>>

export type AsyncConfig<D, T> = EventFnConfig<T, Async<D>>

// Time

export type Time<D> = EventFn<D, number>

export type TimeConfig<D, T> = number | EventFnConfig<T, Time<D>>

// Value

export type Value<D> = (data: D) => any

export type Values<D, V extends Record<string, Value<D>>> = {
  [key in keyof V]: ReturnType<V[key]>
}

// Target

export type Target<D> = EventFn<D, string>

export type TargetConfig<D> = string | EventFn<D, string>

// Send

export type Event = { event: string; payload: any }

export type Send<D> = EventFn<D, Event>

export type SendConfig<D> = string | Event | EventFn<D, Event>

// Break

export type Break<D> = EventFn<D, boolean>

export type BreakConfig<D> = boolean | EventFn<D, boolean>

// Event Handler Item

export type EventHandlerItem<D> = {
  get: Result<D>[]
  if: Condition<D>[]
  unless: Condition<D>[]
  ifAny: Condition<D>[]
  do: Action<D>[]
  elseDo: Action<D>[]
  to?: Target<D>
  elseTo?: Target<D>
  send?: Send<D>
  elseSend?: Send<D>
  wait?: Time<D>
  break?: Break<D>
}

export type EventHandlerItemConfig<D, R, C, A, T> = {
  get?: MaybeArray<ResultConfig<D, R>>
  if?: MaybeArray<ConditionConfig<D, C>>
  unless?: MaybeArray<ConditionConfig<D, C>>
  ifAny?: MaybeArray<ConditionConfig<D, C>>
  do?: MaybeArray<ActionConfig<D, A>>
  elseDo?: MaybeArray<ActionConfig<D, A>>
  to?: TargetConfig<D>
  elseTo?: TargetConfig<D>
  send?: SendConfig<D>
  elseSend?: SendConfig<D>
  wait?: TimeConfig<D, T>
  break?: BreakConfig<D>
}

// Event Handler

export type EventHandler<D> = Array<EventHandlerItem<D>>

export type EventHandlerConfig<D, R, C, A, T> = MaybeArray<
  ActionConfig<D, A> | EventHandlerItemConfig<D, R, C, A, T>
>

export type RepeatEventHandler<D> = {
  event: EventHandler<D>
  delay?: Time<D>
}

export type RepeatEventHandlerConfig<D, R, C, A, T> = {
  event: EventHandlerConfig<D, R, C, A, T>
  delay?: TimeConfig<D, T>
}
// Async Event Handler

export type AsyncEventHandler<D> = {
  await: Async<D>
  onResolve: EventHandler<D>
  onReject?: EventHandler<D>
}

export type AsyncEventHandlerConfig<D, R, C, A, Y, T> = {
  await: Extract<keyof Y, string> | Async<D>
  onResolve: EventHandlerConfig<D, R, C, A, T>
  onReject?: EventHandlerConfig<D, R, C, A, T>
}

// State

export interface State<D> {
  name: string
  active: boolean
  path: string
  history: string[]
  interval?: any
  on: Record<string, EventHandler<D>>
  onEnter?: EventHandler<D>
  onExit?: EventHandler<D>
  onEvent?: EventHandler<D>
  repeat?: RepeatEventHandler<D>
  async?: AsyncEventHandler<D>
  states: Record<string, State<D>>
  initial?: string
}

export interface StateConfig<D, R, C, A, Y, T, V> {
  on?: Record<string, EventHandlerConfig<D, R, C, A, T>>
  onEnter?: EventHandlerConfig<D, R, C, A, T>
  onExit?: EventHandlerConfig<D, R, C, A, T>
  onEvent?: EventHandlerConfig<D, R, C, A, T>
  repeat?: RepeatEventHandlerConfig<D, R, C, A, T>
  async?: AsyncEventHandlerConfig<D, R, C, A, Y, T>
  states?: Record<string, StateConfig<D, R, C, A, Y, T, V>>
  initial?: string
}

// Config

export interface Config<
  D,
  R extends Record<string, Result<D>> = any,
  C extends Record<string, Condition<D>> = any,
  A extends Record<string, Action<D>> = any,
  Y extends Record<string, Async<D>> = any,
  T extends Record<string, Time<D>> = any,
  V extends Record<string, Value<D>> = any
> extends StateConfig<D, R, C, A, Y, T, V> {
  id?: string
  data?: D
  results?: R
  conditions?: C
  actions?: A
  asyncs?: Y
  times?: T
  values?: V
}

export interface ConfigWithHelpers<
  D,
  R extends Record<string, Result<D>> = any,
  C extends Record<string, Condition<D>> = any,
  A extends Record<string, Action<D>> = any,
  Y extends Record<string, Async<D>> = any,
  T extends Record<string, Time<D>> = any,
  V extends Record<string, Value<D>> = any
> extends Config<D, R, C, A, Y, T, V> {
  createEventHandlerConfig: (
    config: EventHandlerConfig<D, R, C, A, T>
  ) => EventHandlerConfig<D, R, C, A, T>
  createEventHandlerItemConfig: (
    config: EventHandlerItemConfig<D, R, C, A, T>
  ) => EventHandlerItemConfig<D, R, C, A, T>
  createAsyncEventHandlerConfig: (
    config: AsyncEventHandlerConfig<D, R, C, A, Y, T>
  ) => AsyncEventHandlerConfig<D, R, C, A, Y, T>
  createRepeatEventHandlerConfig: (
    config: RepeatEventHandlerConfig<D, R, C, A, T>
  ) => RepeatEventHandlerConfig<D, R, C, A, T>
  createStateConfig: (
    config: StateConfig<D, R, C, A, Y, T, V>
  ) => StateConfig<D, R, C, A, Y, T, V>
  createResultConfig: (config: ResultConfig<D, R>) => ResultConfig<D, R>
  createConditionConfig: (
    config: ConditionConfig<D, C>
  ) => ConditionConfig<D, C>
  createActionConfig: (config: ActionConfig<D, A>) => ActionConfig<D, A>
  createTimeConfig: (config: TimeConfig<D, T>) => TimeConfig<D, T>
  createValueConfig: (config: Value<D>) => Value<D>
}

// Subscribers

export type SubscriberFn<
  D,
  R extends Record<string, Result<D>> = any,
  C extends Record<string, Condition<D>> = any,
  A extends Record<string, Action<D>> = any,
  Y extends Record<string, Async<D>> = any,
  T extends Record<string, Time<D>> = any,
  V extends Record<string, Value<D>> = any
> = (update: StateDesigner<D, R, C, A, Y, T, V>) => void

// State Designer

export interface StateDesigner<
  D,
  R extends Record<string, Result<D>>,
  C extends Record<string, Condition<D>>,
  A extends Record<string, Action<D>>,
  Y extends Record<string, Async<D>>,
  T extends Record<string, Time<D>>,
  V extends Record<string, Value<D>>
> {
  id: string
  data: D
  active: State<D>[]
  stateTree: State<D>
  onUpdate: (callbackFn: SubscriberFn<D>) => () => void
  getUpdate: (callbackFn: SubscriberFn<D>) => void
  send: (
    eventName: string,
    payload?: any
  ) => Promise<StateDesigner<D, R, C, A, Y, T, V>>
  can: (eventName: string, payload?: any) => boolean
  isIn: (...paths: string[]) => boolean
  isInAny: (...paths: string[]) => boolean
  whenIn: (
    states: { [key: string]: any },
    reducer?: (
      previousValue: any,
      currentValue: [string, any],
      currentIndex: number,
      array: [string, any][]
    ) => any,
    initial?: any
  ) => any
  getConfig: () => Config<D, R, C, A, Y, T, V>
  clone: () => StateDesigner<D, R, C, A, Y, T, V>
  values: Values<D, V>
}
