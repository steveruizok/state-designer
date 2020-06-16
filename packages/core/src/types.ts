export type MaybeArray<T> = T | T[]

export type Reducer<T> = (
  acc: any,
  entry: [string, any],
  index: number,
  array: [string, any][]
) => T

// Event Functions

export type EventFn<D, T> = (data: D, payload?: any, result?: any) => T

export type EventFnDesign<T, K> = Extract<keyof T, string> | K

// Action

export type Action<D> = EventFn<D, any>

export type ActionDesign<D, T> = EventFnDesign<T, EventFn<D, any>>

// Condition

export type Condition<D> = EventFn<D, boolean>

export type ConditionDesign<D, T> = EventFnDesign<T, Condition<D>>

// Result

export type Result<D> = EventFn<D, any>

export type ResultDesign<D, T> = EventFnDesign<T, Result<D>>

// Async

export type Async<D> = EventFn<D, Promise<any>>

export type AsyncDesign<D, T> = EventFnDesign<T, Async<D>>

// Time

export type Time<D> = EventFn<D, number>

export type TimeDesign<D, T> = number | EventFnDesign<T, Time<D>>

// Value

export type Value<D> = (data: D) => any

export type Values<D, V extends Record<string, Value<D>>> = {
  [key in keyof V]: ReturnType<V[key]>
}

export type ReturnedValues<D, V extends Record<string, Value<D>>> = {
  [key in keyof V]: ReturnType<V[key]>
}

// Target

export type Target<D> = EventFn<D, string>

export type TargetDesign<D> = MaybeArray<string | EventFn<D, string>>

// Send

export type Event = { event: string; payload: any }

export type Send<D> = EventFn<D, Event>

export type SendDesign<D> = string | Event | EventFn<D, Event>

// Break

export type Break<D> = EventFn<D, boolean>

export type BreakDesign<D> = boolean | EventFn<D, boolean>

// Intitial

export type InitialTargetDesign<D> = string | EventFn<D, string>

export type InitialStateObject<D> = {
  get: Result<D>[]
  if: Condition<D>[]
  unless: Condition<D>[]
  unlessAny: Condition<D>[]
  ifAny: Condition<D>[]
  to: Target<D>
  then?: InitialStateObject<D>
  else?: InitialStateObject<D>
}

export type InitialStateObjectDesign<D, C, R> =
  | InitialStateObjectDesignWithoutLogic<D>
  | InitialStateObjectDesignWithLogic<D, C, R>

export type InitialStateObjectDesignWithoutLogic<D> =
  | string
  | {
      to: InitialTargetDesign<D>
    }

export type InitialStateObjectDesignWithLogic<D, C, R> = {
  get?: MaybeArray<ResultDesign<D, R>>
  if?: MaybeArray<ConditionDesign<D, C>>
  unless?: MaybeArray<ConditionDesign<D, C>>
  ifAny?: MaybeArray<ConditionDesign<D, C>>
  unlessAny?: MaybeArray<ConditionDesign<D, C>>
  else: InitialStateObjectDesign<D, C, R>
  to: InitialTargetDesign<D>
  then: InitialStateObjectDesign<D, C, R>
}

export type InitialStateDesign<D, C, R> =
  | string
  | InitialStateObjectDesign<D, C, R>

// Event Handler Object

export type EventHandlerObject<D> = {
  get: Result<D>[]
  if: Condition<D>[]
  unless: Condition<D>[]
  ifAny: Condition<D>[]
  unlessAny: Condition<D>[]
  do: Action<D>[]
  secretlyDo: Action<D>[]
  to: Target<D>[]
  secretlyTo: Target<D>[]
  send?: Send<D>
  wait?: Time<D>
  break?: Break<D>
  then?: EventHandler<D>
  else?: EventHandler<D>
}

/**
 * What to do when an event is triggered. You can define an event as an array of these objects.
 */
export type EventHandlerObjectDesign<D, R, C, A, T> = {
  /**
   * The result(s) to compute before running conditions or actions. The returned value will be available as the third argument to event handler functions, such as conditions, actions, and further restults.
   */
  get?: MaybeArray<ResultDesign<D, R>>
  /**
   * One or more condition(s) to test. If any condition returns false, the handler will not run.
   */
  if?: MaybeArray<ConditionDesign<D, C>>
  /**
   * One or more condition(s) to test. If any condition returns true, the handler will run.
   */
  ifAny?: MaybeArray<ConditionDesign<D, C>>
  /**
   * One or more condition(s) to test. If any condition returns true, the handler will not run.
   */
  unless?: MaybeArray<ConditionDesign<D, C>>
  /**
   * One or more condition(s) to test. If any condition returns false, the handler will run.
   */
  unlessAny?: MaybeArray<ConditionDesign<D, C>>
  /**
   * The action(s) to perform. These actions can mutate the data property. Note: Defining actions will cause this event to trigger an update.
   */
  do?: MaybeArray<ActionDesign<D, A>>
  /**
   * The "secret" action(s) to perform. These actions cannot mutate the data property. Note: Defining "secret" actions will NOT cause this event to trigger an update.
   */
  secretlyDo?: MaybeArray<ActionDesign<D, A>>
  /**
   * A transition target: either a state's name or path. Defining a target will cause this handler to trigger an update.
   */
  to?: TargetDesign<D>
  /**
   * A transition target: either a state's name or path. Defining a target will not cause this handler to trigger an update.
   */
  secretlyTo?: TargetDesign<D>
  /**
   * An event name and (optionally) payload to send to the state.
   */
  send?: SendDesign<D>
  /**
   * A delay (in seconds) to wait before running this handler object.
   */
  wait?: TimeDesign<D, T>
  /**
   * Whether this item should stop the event's other handlers objects from running.
   */
  break?: BreakDesign<D>
  /**
   * An additional event handler to run if this event handler object passed its conditions.
   */
  then?: EventHandlerDesign<D, R, C, A, T>
  /**
   * An event handler to run instead if this event handler object did not pass its conditions.
   */
  else?: EventHandlerDesign<D, R, C, A, T>
}

// Event Handler

export type EventHandler<D> = Array<EventHandlerObject<D>>

export type EventHandlerDesign<D, R, C, A, T> = MaybeArray<
  ActionDesign<D, A> | EventHandlerObjectDesign<D, R, C, A, T>
>

export type RepeatEvent<D> = {
  onRepeat: EventHandler<D>
  delay?: Time<D>
}

export type RepeatEventDesign<D, R, C, A, T> = {
  onRepeat: EventHandlerDesign<D, R, C, A, T>
  delay?: TimeDesign<D, T>
}
// Async Event Handler

export type AsyncEvent<D> = {
  await: Async<D>
  onResolve: EventHandler<D>
  onReject?: EventHandler<D>
}

export type AsyncEventDesign<D, R, C, A, Y, T> = {
  await: Extract<keyof Y, string> | Async<D>
  onResolve: EventHandlerDesign<D, R, C, A, T>
  onReject?: EventHandlerDesign<D, R, C, A, T>
}

// Verbose Logging Types

export enum VerboseType {
  Condition = "condition",
  Action = "action",
  SecretAction = "secretAction",
  Event = "event",
  State = "state",
  AsyncEvent = "asyncEvent",
  TransitionEvent = "transitionEvent",
  RepeatEvent = "repeatEvent",
  Transition = "transition",
  Notification = "notification",
  EventHandler = "eventHandler",
  Queue = "queue",
}

// State

export interface State<D, V> {
  name: string
  active: boolean
  path: string
  history: string[]
  activeId: number
  times: {
    timeouts: any[]
    interval?: any
    animationFrame?: number
    cancelAsync?: () => void
  }
  on: Record<string, EventHandler<D> & ThisType<DesignedState<D, V>>>
  onEnter?: EventHandler<D>
  onExit?: EventHandler<D>
  onEvent?: EventHandler<D>
  repeat?: RepeatEvent<D>
  async?: AsyncEvent<D>
  states: Record<string, State<D, V>>
  initialFn?: InitialStateObject<D>
  initial?: string
}

export interface StateDesign<D, R, C, A, Y, T, V> {
  on?: Record<string, EventHandlerDesign<D, R, C, A, T>>
  onEnter?: EventHandlerDesign<D, R, C, A, T>
  onExit?: EventHandlerDesign<D, R, C, A, T>
  onEvent?: EventHandlerDesign<D, R, C, A, T>
  repeat?: RepeatEventDesign<D, R, C, A, T>
  async?: AsyncEventDesign<D, R, C, A, Y, T>
  states?: Record<string, StateDesign<D, R, C, A, Y, T, V>>
  initial?: InitialStateDesign<D, C, R>
}

// Design

export interface Design<
  D,
  R extends Record<string, Result<D>> = any,
  C extends Record<string, Condition<D>> = any,
  A extends Record<string, Action<D>> = any,
  Y extends Record<string, Async<D>> = any,
  T extends Record<string, number | Time<D>> = any,
  V extends Record<string, Value<D>> = any
> extends StateDesign<D, R, C, A, Y, T, V> {
  id?: string
  data?: D
  results?: R
  conditions?: C
  actions?: A
  asyncs?: Y
  times?: T
  values?: V
}

export interface DesignWithHelpers<
  D,
  R extends Record<string, Result<D>>,
  C extends Record<string, Condition<D>>,
  A extends Record<string, Action<D>>,
  Y extends Record<string, Async<D>>,
  T extends Record<string, number | Time<D>>,
  V extends Record<string, Value<D>>
> extends Design<D, R, C, A, Y, T, V> {
  createEventHandlerDesign: (
    design: EventHandlerDesign<D, R, C, A, T>
  ) => EventHandlerDesign<D, R, C, A, T>
  createEventHandlerObjectDesign: (
    design: EventHandlerObjectDesign<D, R, C, A, T>
  ) => EventHandlerObjectDesign<D, R, C, A, T>
  createAsyncEventDesign: (
    design: AsyncEventDesign<D, R, C, A, Y, T>
  ) => AsyncEventDesign<D, R, C, A, Y, T>
  createRepeatEventDesign: (
    design: RepeatEventDesign<D, R, C, A, T>
  ) => RepeatEventDesign<D, R, C, A, T>
  createState: (
    design: StateDesign<D, R, C, A, Y, T, V>
  ) => StateDesign<D, R, C, A, Y, T, V>
  createResultDesign: (design: ResultDesign<D, R>) => ResultDesign<D, R>
  createConditionDesign: (
    design: ConditionDesign<D, C>
  ) => ConditionDesign<D, C>
  createActionDesign: (design: ActionDesign<D, A>) => ActionDesign<D, A>
  createTimeDesign: (design: TimeDesign<D, T>) => TimeDesign<D, T>
  createValueDesign: (design: Value<D>) => Value<D>
}

// Subscribers

export type SubscriberFn<T> = (update: T) => void

// State Design

export interface DesignedState<D, V> {
  id: string
  data: D
  values: V
  active: string[]
  stateTree: State<D, V>
  can: (eventName: string, payload?: any) => boolean
  isIn: (...paths: string[]) => boolean
  isInAny: (...paths: string[]) => boolean
  whenIn: <T = unknown>(
    states: { [key: string]: any },
    reducer?: "value" | "array" | Reducer<T>,
    initial?: any
  ) => T
  send: (eventName: string, payload?: any) => Promise<DesignedState<D, V>>
  onUpdate: (callbackFn: SubscriberFn<DesignedState<D, V>>) => () => void
  getUpdate: (callbackFn: SubscriberFn<DesignedState<D, V>>) => void
  getDesign: () => any
  clone: () => DesignedState<D, V>
  reset: () => DesignedState<D, V>
}

// State with Design
export type StateWithDesign<
  State extends Design<unknown, any, any, any, any, any, any>
> = DesignedState<
  State["data"],
  {
    [key in keyof State["values"]]: ReturnType<State["values"][key]>
  }
>

// Event Handler Chains

export type EventChainOptions<D> = {
  state: State<D, any>
  data: D
  result: any
  payload: any
  handler: EventHandler<D>
  onDelayedOutcome: EventChainCallback<D>
  getFreshDataAfterWait: () => D
}

export type EventChainCore<D> = {
  data: D
  payload: any
  result: any
}

export type EventChainOutcome<D> = {
  data: D
  result: any
  shouldBreak: boolean
  shouldNotify: boolean
  pendingTransition: string[]
  pendingSend?: Event
}

export type EventChainCallback<D> = (outcome: EventChainOutcome<D>) => void
