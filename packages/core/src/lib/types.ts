import { Draft } from "immer";

export type MaybeArray<T> = T | T[];

// Event Functions

export type EventFn<D, T> = (data: Draft<D>, payload?: any, result?: any) => T;

export type EventFnConfig<T, K> = Extract<keyof T, string> | K;

// Action

export type Action<D> = EventFn<D, any>;

export type ActionConfig<D, T> = EventFnConfig<T, Action<D>>;

// Condition

export type Condition<D> = EventFn<D, boolean>;

export type ConditionConfig<D, T> = EventFnConfig<T, Condition<D>>;

// Result

export type Result<D> = EventFn<D, any>;

export type ResultConfig<D, T> = EventFnConfig<T, Result<D>>;

// Async

export type Async<D> = EventFn<D, Promise<any>>;

export type AsyncConfig<D, T> = EventFnConfig<T, Async<D>>;

// Timer

export type Timer<D> = EventFn<D, number>;

export type TimerConfig<D, T> = number | EventFnConfig<T, Timer<D>>;

// Target

export type Target<D> = EventFn<D, string>;

export type TargetConfig<D> = string | EventFn<D, string>;

// Send

export type SendItem = { event: string; payload: any };

export type Send<D> = EventFn<D, SendItem>;

export type SendConfig<D> = string | SendItem | EventFn<D, SendItem>;

// Break

export type Break<D> = EventFn<D, boolean>;

export type BreakConfig<D> = boolean | EventFn<D, boolean>;

// Event Handler Item

export type EventHandlerItem<D> = {
  get: Result<D>[];
  if: Condition<D>[];
  unless: Condition<D>[];
  ifAny: Condition<D>[];
  do: Action<D>[];
  elseDo: Action<D>[];
  to?: Target<D>;
  elseTo?: Target<D>;
  send?: Send<D>;
  wait?: Timer<D>;
  break?: Break<D>;
};

export type EventHandlerItemConfig<D, R, C, A, T> = {
  get?: MaybeArray<ResultConfig<D, R>>;
  if?: MaybeArray<ConditionConfig<D, C>>;
  unless?: MaybeArray<ConditionConfig<D, C>>;
  ifAny?: MaybeArray<ConditionConfig<D, C>>;
  do?: MaybeArray<ActionConfig<D, A>>;
  elseDo?: MaybeArray<ActionConfig<D, A>>;
  to?: TargetConfig<D>;
  elseTo?: TargetConfig<D>;
  send?: SendConfig<D>;
  wait?: TimerConfig<D, T>;
  break?: BreakConfig<D>;
};

// Event Handler

export type EventHandler<D> = Array<EventHandlerItem<D>>;

export type EventHandlerConfig<D, R, C, A, T> = MaybeArray<
  ActionConfig<D, A> | EventHandlerItemConfig<D, R, C, A, T>
>;

export type RepeatEventHandler<D> = {
  event: EventHandler<D>;
  delay: Timer<D>;
};

export type RepeatEventHandlerConfig<D, R, C, A, T> = {
  event: EventHandlerConfig<D, R, C, A, T>;
  delay?: TimerConfig<D, T>;
};
// Async Event Handler

export type AsyncEventHandler<D> = {
  await: Async<D>;
  onResolve: EventHandler<D>;
  onReject?: EventHandler<D>;
};

export type AsyncEventHandlerConfig<D, R, C, A, Y, T> = {
  await: Extract<keyof Y, string> | Async<D>;
  onResolve: EventHandlerConfig<D, R, C, A, T>;
  onReject?: EventHandlerConfig<D, R, C, A, T>;
};

// State

export interface State<D> {
  name: string;
  active: boolean;
  path: string;
  history: string[];
  intervals: any[];
  on: Record<string, EventHandler<D>>;
  onEnter?: EventHandler<D>;
  onExit?: EventHandler<D>;
  onEvent?: EventHandler<D>;
  repeat?: RepeatEventHandler<D>;
  async?: AsyncEventHandler<D>;
  states: Record<string, State<D>>;
  initial?: string;
}

export interface StateConfig<D, R, C, A, Y, T> {
  on?: Record<string, EventHandlerConfig<D, R, C, A, T>>;
  onEnter?: EventHandlerConfig<D, R, C, A, T>;
  onExit?: EventHandlerConfig<D, R, C, A, T>;
  onEvent?: EventHandlerConfig<D, R, C, A, T>;
  repeat?: RepeatEventHandlerConfig<D, R, C, A, T>;
  async?: AsyncEventHandlerConfig<D, R, C, A, Y, T>;
  states?: Record<string, StateConfig<D, R, C, A, Y, T>>;
  initial?: string;
}

// Config

export interface Config<
  D extends unknown,
  R extends Record<string, Result<D>> = any,
  C extends Record<string, Condition<D>> = any,
  A extends Record<string, Action<D>> = any,
  Y extends Record<string, Async<D>> = any,
  T extends Record<string, Timer<D>> = any
> extends StateConfig<D, R, C, A, Y, T> {
  data?: D;
  results?: R;
  conditions?: C;
  actions?: A;
  asyncs?: Y;
  times?: T;
}

// Subscribers

export type SubscriberFn<D> = (update: Update<D>) => void;

export type Update<D> = {
  data: D;
  stateTree: State<D>;
};

// State Designer

export interface StateDesigner<D> {
  data: D;
  stateTree: State<D>;
  subscribe: (callbackFn: SubscriberFn<D>) => () => void;
  unsubscribe: (callbackFn: SubscriberFn<D>) => void;
  send: (eventName: string, payload?: any) => Promise<Update<D>>;
  can: (eventName: string, payload?: any) => boolean;
  isIn: (paths: string | string[]) => boolean;
  whenIn: (
    states: { [key: string]: any },
    reducer?: (
      previousValue: any,
      currentValue: [string, any],
      currentIndex: number,
      array: [string, any][]
    ) => any,
    initial?: any
  ) => any;
}
