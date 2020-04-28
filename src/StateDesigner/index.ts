import castArray from "lodash/castArray"
import uniqueId from "lodash/uniqueId"
import produce, { Draft, enableMapSet, setAutoFreeze } from "immer"

setAutoFreeze(false)
enableMapSet()

// Actions

export type MaybeArray<T> = T | T[]

export type IAction<D> = (data: D | Draft<D>, payload: any, result: any) => any

export interface IActionConfig<D> {
  (data: D, payload: any, result: any): any
}

// Conditions

export type ICondition<D> = (data: D, payload: any, result: any) => boolean

export interface IConditionConfig<D> {
  (data: D, payload: any, result: any): boolean
}

// Results

export type IResult<D> = (data: D, payload: any, result: any) => any

export interface IResultConfig<D> {
  (data: D, payload: any, result: any): void
}

// Time Values

export type ITime<D> = (data: D) => number

// Async Results

export type IAsyncResult<D> = (
  data: D,
  payload: any,
  result: any
) => Promise<any>

// Config records for named functions
export type ActionsCollection<D> = Record<string, IActionConfig<D>>
export type ConditionsCollection<D> = Record<string, IConditionConfig<D>>
export type ResultsCollection<D> = Record<string, IResultConfig<D>>
export type AsyncsCollection<D> = Record<string, IAsyncResult<D>>

// Handler configurations

export type IActionsConfig<D, A> = MaybeArray<
  A extends undefined ? IActionConfig<D> : keyof A | IActionConfig<D>
>

export type IConditionsConfig<D, C> = MaybeArray<
  C extends undefined ? IConditionConfig<D> : keyof C | IConditionConfig<D>
>

export type IResultsConfig<D, R> = MaybeArray<
  R extends undefined ? IResultConfig<D> : keyof R | IResultConfig<D>
>

export type IAsyncResultsConfig<D, Y> = MaybeArray<
  Y extends undefined ? IAsyncResult<D> : keyof Y | IAsyncResult<D>
>

// Event Handlers (Config)

export interface IEventHandlerConfig<D, A, C, R, Y> {
  do?: IActionsConfig<D, A>
  elseDo?: IActionsConfig<D, A>
  if?: IConditionsConfig<D, C>
  ifAny?: IConditionsConfig<D, C>
  unless?: IConditionsConfig<D, C>
  get?: IResultsConfig<D, R>
  to?: string
  send?: string | [string, any]
  wait?: number | ITime<D>
  break?: boolean
}

export type IEventConfigValue<D, A, C, R, Y> = A extends Record<string, never>
  ? IActionConfig<D> | IEventHandlerConfig<D, A, C, R, Y>
  : keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R, Y>

export type IEventConfig<D, A, C, R, Y> = MaybeArray<
  IEventConfigValue<D, A, C, R, Y>
>

export type IEventsConfig<D, A, C, R, Y> = Record<
  string,
  IEventConfig<D, A, C, R, Y>
>

// Event Handlers (final)

export interface IEventHandler<D> {
  do: IAction<D>[]
  elseDo: IAction<D>[]
  if: ICondition<D>[]
  ifAny: ICondition<D>[]
  unless: ICondition<D>[]
  get: IResult<D>[]
  to?: string
  send?: string | [string, any]
  wait?: number | ITime<D>
  break?: boolean
}

export type IEvent<D> = IEventHandler<D>[]

type IEvents<D> = Record<string, IEvent<D>>

// Repeat Event

export interface IRepeatEventConfig<D, A, C, R, Y> {
  event: IEventConfig<D, A, C, R, Y>
  delay?: number | ITime<D>
}

export interface IRepeatEvent<D> {
  event: IEvent<D>
  delay: number | ITime<D>
}

// Async Event

export interface IAsyncEventConfig<D, A, C, R, Y> {
  await: IAsyncResultsConfig<D, Y>
  onResolve: IEventConfig<D, A, C, R, Y>
  onReject: IEventConfig<D, A, C, R, Y>
}

export interface IAsyncEvent<D> {
  asyncFns: IAsyncResult<D>[]
  onResolve: IEvent<D>
  onReject: IEvent<D>
}

// Named functions

type NamedFunctions<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> = {
  actions?: A
  conditions?: C
  results?: R
  asyncs?: Y
}

// States

export interface IStateConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> {
  initial?: string
  states?: IStatesConfig<D, A, C, R, Y>
  async?: IAsyncEventConfig<D, A, C, R, Y>
  onEnter?: IEventConfig<D, A, C, R, Y>
  onExit?: IEventConfig<D, A, C, R, Y>
  onEvent?: IEventConfig<D, A, C, R, Y>
  onEventComplete?: IEventConfig<D, A, C, R, Y>
  repeat?: MaybeArray<IRepeatEventConfig<D, A, C, R, Y>>
  on?: IEventsConfig<D, A, C, R, Y>
}

export type IStatesConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> = Record<string, IStateConfig<D, A, C, R, Y>>

// Graph

export namespace Graph {
  export interface Export<D> extends Graph.Node {
    collections: Graph.Collection[]
    data: D
  }

  export interface Collection {
    name: string
    items: {
      name: string
      value: string
    }[]
  }

  export interface Node {
    path: string
    name: string
    active: boolean
    initial: boolean
    type: string
    autoEvents: Event[]
    events: Event[]
    states: Node[]
  }

  export type Event = {
    name: string
    eventHandlers: EventHandler[]
  }

  export type EventHandler = {
    get: string[]
    if: string[]
    ifAny: string[]
    unless: string[]
    do: string[]
    elseDo: string[]
    to: string
    wait: string
    send: string | { name: string; payload: string }
  }
}

// Machine subscriber

export type Subscriber<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> = (snapshot: {
  data: D
  active: string[]
  graph: Graph.Export<D>
  state: IStateNode<D, A, C, R, Y>
}) => void

// State Designer Config

export type StateDesignerConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> = {
  data?: D
  on?: IEventsConfig<D, A, C, R, Y>
  onEvent?: IEventConfig<D, A, C, R, Y>
  onEventComplete?: IEventConfig<D, A, C, R, Y>
  initial?: string
  states?: IStatesConfig<D, A, C, R, Y>
  actions?: A
  conditions?: C
  results?: R
  asyncs?: Y
} & ThisType<StateDesigner<D, A, C, R, Y>>

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

export function createStateDesignerConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
>(options: StateDesignerConfig<D, A, C, R, Y>) {
  return options
}

export function createStateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
>(options: StateDesignerConfig<D, A, C, R, Y>, id = "0") {
  const statedesigner = new StateDesigner(options)

  if (!(globalThis as any).statedesigners) {
    ;(globalThis as any).statedesigners = {}
  }

  ;(globalThis as any).statedesigners[id] = statedesigner

  return statedesigner
}

/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */
/* --------------------- Machine -------------------- */

class StateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> {
  private _initialData: D
  private _initialOptions: any
  private _active: IStateNode<D, A, C, R, Y>[] = []
  private _activeNames: string[]
  private _graph: Graph.Export<D>
  private _collections: {
    actions?: A
    conditions?: C
    results?: R
    asyncs?: Y
  }
  private _subscribers = new Set<Subscriber<D, A, C, R, Y>>([])
  private _pendingSend: [string, any][] = []
  private _root: IStateNode<D, A, C, R, Y>
  private record: EventRecord<D> = {
    send: false,
    break: false,
    action: false,
    transition: undefined,
    transitions: 0,
  }

  id = uniqueId()
  data: D
  namedFunctions: NamedFunctions<D, A, C, R, Y>

  constructor(options = {} as StateDesignerConfig<D, A, C, R, Y>) {
    const {
      data,
      initial,
      states = {},
      on = {},
      onEvent,
      onEventComplete,
      actions,
      conditions,
      results,
      asyncs,
    } = options

    if (data === undefined) {
      this.data = data as D
    } else {
      this.data = data as D
    }

    this.namedFunctions = {
      actions,
      conditions,
      results,
      asyncs,
    }

    this._root = new IStateNode({
      machine: this,
      on,
      onEvent,
      onEventComplete,
      states,
      initial,
      name: "root",
      active: true,
    })

    this._initialData = this.data

    this._initialOptions = {
      machine: this,
      on,
      onEvent,
      onEventComplete,
      states,
      initial,
      name: "root",
      active: true,
    }

    this._collections = {
      actions,
      conditions,
      results,
      asyncs,
    }

    this._root = new IStateNode(this._initialOptions)

    this._active = this._root.getActive()
    this._activeNames = this._active.flatMap((state) => [
      state.name,
      state.path,
    ])
    this._graph = this.getGraph()

    for (let state of this._active) {
      const { onEnter } = state.autoEvents
      if (onEnter !== undefined) {
        this.handleAutoEvent(state, onEnter, undefined, undefined)
      }

      if (state.asyncEvent !== undefined) {
        this.handleAsyncEvent(state, state.asyncEvent)
      }

      if (state.repeatEvents.length > 0) {
        for (let event of state.repeatEvents) {
          this.handleRepeatEvent(state, event)
        }
      }
    }
  }

  private updatePublicData = () => {
    this._active = this._root.getActive()
    this._activeNames = this._active.flatMap((state) => [
      state.name,
      state.path,
    ])
    this._graph = this.getGraph()
  }

  private getGraph() {
    const collections: Graph.Collection[] = Object.entries(
      this._collections
    ).map(([key, value]) => {
      return {
        name: key,
        items: value
          ? Object.entries(value as Record<any, Function>).map(
              ([key, value]) => ({
                name: key,
                value: value.toString(),
              })
            )
          : [],
      }
    })

    return {
      data: this.data,
      ...this.graphNode(this._root),
      collections,
    }
  }

  private graphNode(state: IStateNode<D, A, C, R, Y>): Graph.Node {
    return {
      name: state.name,
      path: state.path,
      active: state.active,
      initial: state.parent
        ? state.parent.type === "branch" && state.parent.initial === state.name
        : true,
      autoEvents: graphAutoEvents(state),
      events: getEvents(state),
      type: state.type,
      states:
        state.type === "leaf"
          ? []
          : state.children.map((child: any) => this.graphNode(child)),
    }
  }

  /**
   * Share certain information with each of the machine's _subscribers.
   */
  private notifySubscribers = () => {
    this._subscribers.forEach((subscriber) =>
      subscriber({
        data: this.data,
        active: this.active,
        graph: this.graph,
        state: this._root,
      })
    )
  }

  /**
   * Adds an `onChange` callback to the machine's _subscribers. This `onChange` callback will be called whenever the machine changes its data or graph. Returns a second callback to unsubscribe that callback. (This is makes out hook pretty.)
   */
  subscribe = (onChange: Subscriber<D, A, C, R, Y>) => {
    this._subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  /**
   * Remove an `onChange` callback from the machine's _subscribers.
   */
  unsubscribe = (onChange: Subscriber<D, A, C, R, Y>) => {
    this._subscribers.delete(onChange)
  }

  /**
   * Resets the machine to its initial state.
   */
  reset = () => {
    // Restore data
    this.data = this._initialData

    // Rebuild state tree
    this._root = new IStateNode(this._initialOptions)

    this.resetRecord()
    this.updatePublicData()

    // Notify _subscribers
    this.notifySubscribers()
  }

  /**
   * Can the machine respond to a given event?
   */
  can = (event: string, payload?: any): boolean => {
    for (let state of this._active) {
      let eventHandlers = state.events[event]
      if (eventHandlers !== undefined) {
        for (let handler of eventHandlers) {
          let result: any
          for (let resolver of handler.get) {
            result = resolver(this.data, payload, result)
          }

          if (state.canEventHandlerRun(handler, this.data, payload, result)) {
            return true
          }
        }
      }
    }

    return false
  }

  /**
   * Is the machine in the given state name?
   */
  isIn = (...states: string[]) => {
    return states.every((s) =>
      this._active.find((v) => v.path.endsWith("." + s)) ? true : false
    )
  }

  get state() {
    return this._root
  }

  get graph() {
    return this._graph
  }

  get active() {
    return this._activeNames
  }

  // From here on, it's all event handling and state transition stuff

  send = async (eventName: string, payload?: any) => {
    // if isBusy, add to queue?
    this.resetRecord()

    const activeStates = this._active

    for (let state of activeStates) {
      if (this.record.send || this.record.transition) break
      await this.handleEvent(state, state.events[eventName], payload)

      if (this.record.transition !== undefined) {
        while (this.record.transition !== undefined) {
          this.enactTransition(this.record.transition, payload)
        }
      }

      if (state.autoEvents.onEvent !== undefined) {
        this.handleAutoEvent(
          state,
          state.autoEvents.onEvent,
          payload,
          undefined
        )
      }
    }

    if (this.record.transitions > 0 || this.record.action || this.record.send) {
      this.resetRecord()
      this.updatePublicData()

      const next = this._pendingSend.shift()

      if (next !== undefined) {
        const [e, p] = next
        this.send(e, p)
        return
      }

      this.notifySubscribers()
    }

    for (let state of [...activeStates].reverse()) {
      if (state.autoEvents.onEventComplete !== undefined) {
        this.handleAutoEvent(
          state,
          state.autoEvents.onEventComplete,
          undefined,
          undefined
        )
      }
    }
  }

  resetRecord = () => {
    this.record = {
      send: false,
      action: false,
      break: false,
      transition: undefined,
      transitions: 0,
    }
  }

  handleEvent = async (
    state: IStateNode<D, any, any, any, any>,
    event: IEvent<D> | undefined,
    payload: any,
    result?: any
  ) => {
    if (event === undefined) return

    for (let handler of event) {
      const { wait } = handler

      if (wait !== undefined) {
        let t = typeof wait === "number" ? wait : wait(this.data)
        await new Promise((resolve) => setTimeout(resolve, t * 1000))
      }

      this.handleEventHandler(state, handler, payload, result)

      if (this.record.transition !== undefined || this.record.break) break
    }
  }

  handleAsyncEvent(
    state: IStateNode<D, any, any, any, any>,
    asyncEvent: IAsyncEvent<D>
  ) {
    const { asyncFns, onResolve, onReject } = asyncEvent

    const allPromises = asyncFns.map((fn) => {
      fn(this.data, undefined, undefined)
    })

    Promise.all(allPromises)
      .then((resolved) => {
        if (state.active && onResolve !== undefined) {
          this.handleAutoEvent(state, onResolve, undefined, resolved)
        }
      })
      .catch((rejected) => {
        if (state.active && onResolve !== undefined) {
          this.handleAutoEvent(state, onReject, undefined, rejected)
        }
      })
  }

  handleRepeatEvent = async (
    state: IStateNode<D, any, any, any, any>,
    repeatEvent: IRepeatEvent<D>
  ) => {
    const { event, delay } = repeatEvent

    this.handleAutoEvent(state, event, undefined, undefined)

    if (delay !== undefined) {
      let t = typeof delay === "number" ? delay : delay(this.data)
      await new Promise((resolve) => setTimeout(resolve, t * 1000))
      if (this.isIn(state.name)) {
        this.handleRepeatEvent(state, repeatEvent)
      }
    }
  }

  handleAutoEvent = async (
    state: IStateNode<D, any, any, any, any>,
    event: IEvent<D>,
    payload: any,
    returned: any,
    ignoreActive = false
  ) => {
    if (!state.active && !ignoreActive) return

    this.resetRecord()

    await this.handleEvent(state, event, payload, returned)

    if (this.record.transition !== undefined) {
      while (this.record.transition !== undefined) {
        this.enactTransition(this.record.transition, payload)
      }
    }

    if (this.record.transitions > 0 || this.record.action || this.record.send) {
      this.resetRecord()
      this.updatePublicData()

      const next = this._pendingSend.shift()

      if (next !== undefined) {
        const [e, p] = next
        this.send(e, p)
        return
      }

      this.notifySubscribers()
    } else {
      return
    }
  }

  handleEventHandler = (
    state: IStateNode<D, any, any, any, any>,
    handler: IEventHandler<D>,
    payload: any,
    result?: any
  ) => {
    const {
      do: actions,
      elseDo: elseActions,
      get: resolvers,
      to: transition,
      send,
      break: shouldBreak,
    } = handler

    for (let resolver of resolvers) {
      try {
        result = resolver(this.data, payload, result)
      } catch (e) {
        console.error("Error in Resolver!", resolver, e.message)
        return
      }
    }

    try {
      const canRun = state.canEventHandlerRun(
        handler,
        this.data,
        payload,
        result
      )

      if (!canRun) {
        // Run "elseDo" actions and break
        for (let action of elseActions) {
          this.record.action = true
          try {
            this.data = produce(this.data, (draft) => {
              action(draft, payload, result)
            })
          } catch (e) {
            console.error(`Error in Else Actions!`, action, e.message)
            break
          }
        }
        return
      }
    } catch (e) {
      console.error("Error in Else Actions!", handler, e.message)
      return
    }

    for (let action of actions) {
      this.record.action = true
      try {
        this.data = produce(this.data, (draft) => {
          action(draft, payload, result)
        })
      } catch (e) {
        console.error(`Error in Actions!`, action, e.message)
        break
      }
    }

    if (shouldBreak) {
      this.record.break = true
    }

    if (transition !== undefined) {
      this.handleTransitionItem(state, transition)
      return
    }

    if (send !== undefined) {
      this.record.send = true
      this.handleSendItem(send)
      return
    }
  }

  handleSendItem = (send: string | [string, any]) => {
    if (Array.isArray(send)) {
      this._pendingSend.push(send)
    } else {
      this._pendingSend.push([send, undefined])
    }
  }

  handleTransitionItem = (
    state: IStateNode<D, any, any, any, any>,
    transition: string
  ) => {
    let previous = false
    let restore = false

    if (transition.endsWith(".previous")) {
      previous = true
      transition = transition.substring(0, transition.length - 9)
    } else if (transition.endsWith(".restore")) {
      previous = true
      restore = true
      transition = transition.substring(0, transition.length - 8)
    }

    const target = state.getTargetFromTransition(transition, state)

    if (target !== undefined) {
      this.record.transition = {
        previous,
        restore,
        target,
      }
    }
  }

  enactTransition = (transition: TransitionRecord<D>, payload: any) => {
    this.record.transitions++
    this.record.transition = undefined

    if (this.record.transitions > 100) {
      return
    }

    const { target, previous, restore } = transition
    const { onEnter } = target.autoEvents

    target.active = true

    const upChanges = target.activateUp()

    this.handleChanges(target, upChanges, true, previous, restore, payload)

    const downChanges = target.activateDown(previous, restore)

    this.handleChanges(target, downChanges, false, previous, restore, payload)

    if (onEnter !== undefined) {
      this.handleAutoEvent(target, onEnter, payload, undefined)
    }

    if (target.asyncEvent !== undefined) {
      this.handleAsyncEvent(target, target.asyncEvent)
    }

    if (target.repeatEvents.length > 0) {
      for (let event of target.repeatEvents) {
        this.handleRepeatEvent(target, event)
      }
    }
  }

  handleChanges(
    target: IStateNode<D, any, any, any, any>,
    results: IStateNode<D, any, any, any, any>[][],
    andUp: boolean,
    previous: boolean,
    restore: boolean,
    payload: any
  ) {
    const [activateDowns, deactivates] = results

    for (let state of deactivates) {
      state.deactivate()

      if (state.autoEvents.onExit !== undefined) {
        this.handleAutoEvent(
          state,
          state.autoEvents.onExit,
          payload,
          undefined,
          true
        )
      }
    }

    for (let state of activateDowns) {
      state.active = true

      const { onEnter } = state.autoEvents

      if (onEnter !== undefined) {
        this.handleAutoEvent(state, onEnter, payload, undefined)
      }

      if (state.repeatEvents.length > 0) {
        for (let event of state.repeatEvents) {
          this.handleRepeatEvent(state, event)
        }
      }

      if (this.record.transition !== undefined) {
        this.enactTransition(this.record.transition, payload)
      }

      const downChanges = state.activateDown(previous, restore)
      this.handleChanges(state, downChanges, false, previous, restore, payload)
    }

    if (andUp && target.parent !== undefined) {
      if (!target.parent.active) {
        // Activate the parent state
        target.parent.active = true
        this.handleChanges(
          target.parent,
          target.parent.activateUp(),
          true,
          previous,
          restore,
          payload
        )
      }
    }
  }

  destroy() {
    for (let state of this._active) {
      state.active = false
    }
    this.updatePublicData()
  }
}

/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */
/* ------------------- State Node ------------------- */

enum StateType {
  Leaf = "leaf",
  Branch = "branch",
  Parallel = "parallel",
}

type StateConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> = {
  name: string
  parent?: IStateNode<D, A, C, R, Y>
  machine: StateDesigner<D, A, C, R, Y>
  onEnter?: IEventConfig<D, A, C, R, Y>
  onExit?: IEventConfig<D, A, C, R, Y>
  onEvent?: IEventConfig<D, A, C, R, Y>
  onEventComplete?: IEventConfig<D, A, C, R, Y>
  on?: IEventsConfig<D, A, C, R, Y>
  async?: IAsyncEventConfig<D, A, C, R, Y>
  repeat?: MaybeArray<IRepeatEventConfig<D, A, C, R, Y>>
  active: boolean
  initial?: string
  states?: IStatesConfig<D, A, C, R, Y>
}

export class IStateNode<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined,
  Y extends AsyncsCollection<D> | undefined
> {
  name: string
  path: string
  active = false
  machine: StateDesigner<D, A, C, R, Y>
  parent?: IStateNode<D, A, C, R, Y>
  type: StateType
  initial?: string
  previous?: string
  children: IStateNode<D, A, C, R, Y>[] = []
  events: IEvents<D> = {}
  asyncEvent?: IAsyncEvent<D>
  repeatEvents: IRepeatEvent<D>[]
  autoEvents: {
    onEvent?: IEvent<D>
    onEventComplete?: IEvent<D>
    onEnter?: IEvent<D>
    onExit?: IEvent<D>
  }

  constructor(options = {} as StateConfig<D, A, C, R, Y>) {
    const {
      machine,
      parent,
      on = {},
      name,
      initial,
      states = {},
      onEvent,
      onEventComplete,
      onEnter,
      onExit,
      active,
    } = options

    this.machine = machine

    this.parent = parent

    this.active = active

    this.name = name

    this.path = this.parent ? this.parent.path + "." + name : this.name

    // CHILDREN

    this.initial = initial

    this.children = Object.keys(states).reduce<IStateNode<D, A, C, R, Y>[]>(
      (acc, cur) => {
        const state = states[cur]

        acc.push(
          new IStateNode({
            name: cur,
            machine: this.machine,
            parent: this,
            active: this.active
              ? this.initial === undefined
                ? true
                : cur === this.initial
              : false,
            initial: state.initial,
            states: state.states,
            onEnter: state.onEnter,
            onExit: state.onExit,
            onEvent: state.onEvent,
            onEventComplete: state.onEventComplete,
            on: state.on,
            async: state.async,
            repeat: state.repeat,
          })
        )
        return acc
      },
      []
    )

    // INITIAL STATE

    if (this.initial !== undefined) {
      const initialState = this.children.find((v) => v.name === this.initial)
      if (!initialState) {
        throw new Error("No initial state found!")
      } else {
        this.previous = initialState.name
      }
    }

    // TYPE

    this.type =
      this.children.length === 0
        ? StateType.Leaf
        : this.initial === undefined
        ? StateType.Parallel
        : StateType.Branch

    // EVENTS

    const bindToMachine = (func: Function) => {
      return func.bind(this.machine)
    }

    // We need to return a "full" event handler object, but the
    // config value may either be an anonymous action function,
    // a named action function, or a partial event handler object.

    const { namedFunctions } = this.machine

    // Begin giant typescript mess - TODO: Compress into one function

    function getAction(item: keyof A | IActionConfig<D>) {
      if (typeof item === "function") {
        return item as IAction<D>
      } else if (typeof item === "string") {
        const items = namedFunctions.actions

        if (items === undefined) {
          console.error(Errors.noNamedFunction(item, "action"))
          return
        }

        const callback = items[item]
        if (callback === undefined) {
          console.error(Errors.noMatchingNamedFunction(item, "action"))
          return
        }

        return bindToMachine(callback)
      }
      return
    }

    function getActions(source: any) {
      return castArray(source || []).reduce<IAction<D>[]>((acc, a) => {
        const item = getAction(a)
        return item === undefined ? acc : [...acc, item as IAction<D>]
      }, [])
    }

    function getCondition(item: keyof C | IConditionConfig<D>) {
      if (typeof item === "function") {
        return item as ICondition<D>
      } else if (typeof item === "string") {
        const items = namedFunctions.conditions

        if (items === undefined) {
          console.error(Errors.noNamedFunction(item, "condition"))
          return
        }

        const callback = items[item]
        if (callback === undefined) {
          console.error(Errors.noMatchingNamedFunction(item, "condition"))
          return
        }

        return bindToMachine(callback)
      }

      return
    }

    function getConditions(source: any) {
      return castArray(source || []).reduce<ICondition<D>[]>((acc, a) => {
        const item = getCondition(a)
        return item === undefined ? acc : [...acc, item as ICondition<D>]
      }, [])
    }

    function getResult(item: keyof R | IResultConfig<D>) {
      if (typeof item === "function") {
        return item as IResult<D>
      } else if (typeof item === "string") {
        const items = namedFunctions.results

        if (items === undefined) {
          console.error(Errors.noNamedFunction(item, "result"))
          return
        }

        const callback = items[item]
        if (callback === undefined) {
          console.error(Errors.noMatchingNamedFunction(item, "result"))
          return
        }

        return bindToMachine(callback)
      }
      return
    }

    function getResults(source: any) {
      return castArray(source || []).reduce<IResult<D>[]>((acc, a) => {
        const item = getResult(a)
        return item === undefined ? acc : [...acc, item as IResult<D>]
      }, [])
    }

    // End giant typescript mess

    const getProcessedEvent = (event: IEventConfig<D, A, C, R, Y>) => {
      const handlers = castArray(event as any)

      return handlers.map<IEventHandler<D>>((v) => {
        let result: IEventHandler<D> = {
          get: [],
          if: [],
          unless: [],
          ifAny: [],
          do: [],
          elseDo: [],
          send: undefined,
          to: undefined,
          wait: undefined,
        }

        if (typeof v === "string" || typeof v === "function") {
          const item = getAction(v)
          if (item !== undefined) result.do = [item as IAction<D>]
        } else if (typeof v === "object") {
          result.get = getResults(v.get)
          result.if = getConditions(v.if)
          result.unless = getConditions(v.unless)
          result.ifAny = getConditions(v.ifAny)
          result.do = getActions(v.do)
          result.elseDo = getActions(v.elseDo)
          result.to = v.to
          result.send = v.send
          result.wait = v.wait
          result.break = v.break
        }

        return result
      })
    }

    function getProcessedRepeat(item: IRepeatEventConfig<D, A, C, R, Y>) {
      return {
        event: getProcessedEvent(item.event),
        delay: item.delay || 0.016,
      }
    }

    function getProcessedAsync(item: IAsyncEventConfig<D, A, C, R, Y>) {
      const asyncFns = castArray(item.await).map((fn) => {
        if (typeof fn === "string") {
          if (namedFunctions.asyncs === undefined) {
            console.error(Errors.noNamedFunction(fn, "async"))
            return async function () {}
          } else {
            const found = namedFunctions.asyncs[fn]
            return found
          }
        } else {
          return fn as IAsyncResult<D>
        }
      })

      return {
        asyncFns: asyncFns,
        onReject: getProcessedEvent(item.onReject),
        onResolve: getProcessedEvent(item.onResolve),
      }
    }

    // AUTO EVENTS

    this.autoEvents = {
      onEventComplete: onEventComplete
        ? getProcessedEvent(onEventComplete)
        : undefined,
      onEvent: onEvent ? getProcessedEvent(onEvent) : undefined,
      onEnter: onEnter ? getProcessedEvent(onEnter) : undefined,
      onExit: onExit ? getProcessedEvent(onExit) : undefined,
    }

    this.repeatEvents = options.repeat
      ? castArray(options.repeat).map(getProcessedRepeat)
      : []

    this.asyncEvent = options.async
      ? getProcessedAsync(options.async)
      : undefined

    this.events = Object.keys(on).reduce<IEvents<D>>((acc, key) => {
      acc[key] = getProcessedEvent(on[key])
      return acc
    }, {})
  }

  getTargetFromTransition = (
    transition: string,
    state: IStateNode<D, A, C, R, Y>
  ): IStateNode<D, A, C, R, Y> | undefined => {
    let target: IStateNode<D, A, C, R, Y> | undefined = undefined

    if (transition.includes(".")) {
      let source = state
      let path = transition.split(".")
      for (let step of path) {
        const next = source.children.find((v) => v.name === step)
        if (next === undefined) {
          // console.warn("Could not find that state:", step)
          break
        } else {
          source = next
        }
      }
      target = source
    } else {
      target = undefined
      const next = state.children.find((v) => v.name === transition)
      if (next === undefined) {
        // console.warn("Could not find that state:", transition)
      } else {
        target = next
      }
    }

    if (target !== undefined) {
      // transition to target
      return target
    } else if (state.parent !== undefined) {
      // crawl up tree
      return this.getTargetFromTransition(transition, state.parent)
    }

    return
  }

  activateDown = (previous = false, restore = false) => {
    const activateDowns: IStateNode<D, A, C, R, Y>[] = []
    const deactivates: IStateNode<D, A, C, R, Y>[] = []

    switch (this.type) {
      case StateType.Branch: {
        // Find the child to activate
        const activeChild =
          previous || restore
            ? this.children.find((v) => v.name === this.previous)
            : this.children.find((v) => v.name === this.initial)

        if (activeChild === undefined) {
          // Active child does not exist!
          break
        }

        for (let state of this.children) {
          // Activate active child and de-activate others
          if (state === activeChild) {
            this.previous = activeChild.name
            activateDowns.push(activeChild)
          } else if (state.active) {
            deactivates.push(state)
          }
        }
        break
      }
      case StateType.Parallel: {
        // Activate children
        activateDowns.push(...this.children)
        break
      }
      default: {
        break
      }
    }

    return [activateDowns, deactivates]
  }

  activateUp = () => {
    const activateDowns: IStateNode<D, A, C, R, Y>[] = []
    const deactivates: IStateNode<D, A, C, R, Y>[] = []

    const parent = this.parent as IStateNode<D, A, C, R, Y>

    switch (parent.type) {
      case StateType.Branch: {
        parent.previous = this.name
        // Deactivate siblings
        for (let sib of parent.children) {
          if (sib === this) continue
          if (sib.active) {
            deactivates.push(sib)
          }
        }

        break
      }
      case StateType.Parallel: {
        for (let sib of parent.children) {
          // Activate siblings
          if (sib === this) continue
          if (!sib.active) {
            activateDowns.push(sib)
          }
        }
      }
      default: {
        break
      }
    }

    return [activateDowns, deactivates]
  }

  deactivate = () => {
    this.active = false
    for (let state of this.children) {
      state.deactivate()
    }
  }

  canEventHandlerRun = (
    handler: IEventHandler<D>,
    draft: D,
    payload: any,
    result: any
  ) => {
    // --- Conditions

    // Every `if` condition must return true
    if (
      handler.if.length > 0 &&
      !handler.if.every((c) => c(draft, payload, result))
    )
      return false

    // Every `unless` condition must return false
    if (
      handler.unless.length > 0 &&
      handler.unless.some((c) => c(draft, payload, result))
    )
      return false

    // One or more `ifAny` conditions must return true
    if (
      handler.ifAny.length > 0 &&
      !handler.ifAny.some((c) => c(draft, payload, result))
    )
      return false

    return true
  }

  public getActive = (): IStateNode<D, A, C, R, Y>[] => {
    if (!this.active) {
      return []
    }

    return [
      this,
      ...this.children.reduce<IStateNode<D, A, C, R, Y>[]>((acc, child) => {
        acc.push(...child.getActive())
        return acc
      }, []),
    ]
  }
}

export default StateDesigner

const Errors = {
  noNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s.`,
  noMatchingNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s with that name.`,
}

export type StateDesignerWithConfig<
  C extends StateDesignerConfig<any, any, any, any, any>
> = StateDesigner<
  C["data"],
  C["actions"],
  C["conditions"],
  C["results"],
  C["asyncs"]
>

export type EventRecord<D> = {
  send: boolean
  action: boolean
  transition?: TransitionRecord<D>
  transitions: number
  break: boolean
}

type TransitionRecord<D> = {
  target: IStateNode<D, any, any, any, any>
  previous: boolean
  restore: boolean
}

/* ------------------ Type Sandbox ------------------ */

interface Group<
  A extends Record<string, number> | undefined,
  B extends keyof A
> {
  items?: A
  selected: undefined extends A ? number : B
}

function createGroup<
  A extends Record<string, number> | undefined,
  B extends keyof A
>(group: Group<A, B>) {
  return group
}

createGroup({
  items: { cat: 0 },
  selected: "cat",
})

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

function getGraphHandlerFunction<D>(
  item: IAction<D> | ICondition<D> | IResult<D>,
  eventName: string
) {
  return item.name === "anonymous"
    ? item.toString()
    : item.name === eventName
    ? item.toString().replace(`function ${eventName}`, "function")
    : item.name.replace("bound ", "")
}

function getEvent(event: IEvent<unknown>, eventName: string): Graph.Event {
  return {
    name: eventName,
    eventHandlers: event.map((eventHandler) => ({
      get: eventHandler.get.map((h) => getGraphHandlerFunction(h, eventName)),
      if: eventHandler.if.map((h) => getGraphHandlerFunction(h, eventName)),
      ifAny: eventHandler.ifAny.map((h) =>
        getGraphHandlerFunction(h, eventName)
      ),
      unless: eventHandler.unless.map((h) =>
        getGraphHandlerFunction(h, eventName)
      ),
      elseDo: eventHandler.elseDo.map((h) =>
        getGraphHandlerFunction(h, eventName)
      ),
      do: eventHandler.do.map((h) => getGraphHandlerFunction(h, eventName)),
      to: eventHandler.to || "",
      wait: eventHandler.wait ? eventHandler.wait.toString() : "",

      send: eventHandler.send
        ? Array.isArray(eventHandler.send)
          ? {
              name: eventHandler.send[0],
              payload: JSON.stringify(eventHandler.send[1] || ""),
            }
          : {
              name: eventHandler.send,
              payload: "",
            }
        : "",
    })),
  }
}

// function graphRepeatEvents() {}

// function graphAsyncEvents() {}

function graphAutoEvents(state: IStateNode<any, any, any, any, any>) {
  const autoEvents = [] as Graph.Event[]

  for (let eventName of ["onEnter", "onEvent", "onEventComplete", "onExit"]) {
    let event = state.autoEvents[eventName] as IEvent<unknown> | undefined

    if (event !== undefined) {
      autoEvents.push(getEvent(event, eventName))
    }
  }

  return autoEvents
}

function getEvents(state: IStateNode<any, any, any, any, any>): Graph.Event[] {
  const events = [] as Graph.Event[]

  for (let eventName in state.events) {
    const event = state.events[eventName]
    events.push(getEvent(event, eventName))
  }

  return events
}
