import { ValuesType } from "utility-types"
import castArray from "lodash/castArray"
import uniqueId from "lodash/uniqueId"
import produce, { Draft } from "immer"

// type WithoutNamed<T> = T | T[]
// type NamedOrInSeries<T, U> = keyof U | T | (keyof U | T)[]

// Actions

export type MaybeArray<T> = T | T[]

export type IAction<D> = (data: Draft<D>, payload: any, result: any) => any

export type IActionConfig<D> = (data: D, payload: any, result: any) => any

// Conditions

export type ICondition<D> = (
  data: Draft<D>,
  payload: any,
  result: any
) => boolean

export type IConditionConfig<D> = (
  data: D,
  payload: any,
  result: any
) => boolean

// Results

export type IResult<D> = (data: D | Draft<D>, payload: any, result: any) => any

export type IResultConfig<D> = (
  data: D | Draft<D>,
  payload: any,
  result: any
) => void

// Config records for named functions
export type ActionsCollection<D> = Record<string, IActionConfig<D>>
export type ConditionsCollection<D> = Record<string, IConditionConfig<D>>
export type ResultsCollection<D> = Record<string, IResultConfig<D>>

// Handler configurations

export type IActionsConfig<D, A> = MaybeArray<
  A extends Record<string, never>
    ? IActionConfig<D>
    : keyof A | IActionConfig<D>
>

export type IConditionsConfig<D, C> = MaybeArray<
  C extends Record<string, never>
    ? IConditionConfig<D>
    : keyof C | IConditionConfig<D>
>

export type IResultsConfig<D, R> = MaybeArray<
  R extends Record<string, never>
    ? IResultConfig<D>
    : keyof R | IResultConfig<D>
>

// Event Handlers (Config)

export interface IEventHandlerConfig<D, A, C, R> {
  do?: IActionsConfig<D, A>
  if?: IConditionsConfig<D, C>
  ifAny?: IConditionsConfig<D, C>
  unless?: IConditionsConfig<D, C>
  get?: IResultsConfig<D, R>
  await?: (data: D, payload: any, result: any) => Promise<any>
  to?: string
  send?: string | [string, any]
  wait?: number
  repeatDelay?: number
}

export type IEventConfigValue<D, A, C, R> = A extends Record<string, never>
  ? IActionConfig<D> | IEventHandlerConfig<D, A, C, R>
  : keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>

export type IEventConfig<D, A, C, R> = MaybeArray<IEventConfigValue<D, A, C, R>>

export type IEventsConfig<D, A, C, R> = Record<string, IEventConfig<D, A, C, R>>

// Event Handlers (final)

export interface IEventHandler<D> {
  do: IAction<D>[]
  if: ICondition<D>[]
  ifAny: ICondition<D>[]
  unless: ICondition<D>[]
  get: IResult<D>[]
  to?: string
  await?: <T = any>() => Promise<T>
  send?: string | [string, any]
  wait?: number
  repeatDelay?: number
}

export type IEvent<D> = IEventHandler<D>[]

type IEvents<D> = Record<string, IEvent<D>>

// Named functions

type NamedFunctions<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> = {
  actions?: A
  conditions?: C
  results?: R
}

// States

export interface IStateConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> {
  on?: IEventsConfig<D, A, C, R>
  onEnter?: IEventConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  onResolve?: IEventConfig<D, A, C, R>
  onReject?: IEventConfig<D, A, C, R>
  onRepeat?: IEventConfigValue<D, A, C, R>
  states?: IStatesConfig<D, A, C, R>
  initial?: string
}

export type IStatesConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> = Record<string, IStateConfig<D, A, C, R>>

// Graph

export namespace Graph {
  export type EventHandlerFunction = { name: string; code: string }

  export type EventHandler = {
    do?: EventHandlerFunction[]
    get?: EventHandlerFunction[]
    if?: EventHandlerFunction[]
    unless?: EventHandlerFunction[]
    ifAny?: EventHandlerFunction[]
    to?: string
    wait?: number
    repeatDelay?: number
    send: string
  }

  export type Event = EventHandler[]

  export type Events = Record<string, Event>

  export type AutoEvents = Record<
    "onEnter" | "onEvent" | "onResolve" | "onReject",
    Event
  >

  export interface Node {
    name: string
    active: boolean
    initial: boolean
    autoEvents: AutoEvents
    events: Events
    states?: Node[]
  }
}

// Machine subscriber

export type Subscriber<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> = (
  data: D,
  active: string[],
  graph: Graph.Node,
  state: IStateNode<D, A, C, R>
) => void

// State Designer Config

export type StateDesignerConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> = {
  data?: D
  on?: IEventsConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  initial?: string
  states?: IStatesConfig<D, A, C, R>
  actions?: A
  conditions?: C
  results?: R
} & ThisType<StateDesigner<D, A, C, R>>

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

export function createStateDesignerConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
>(options: StateDesignerConfig<D, A, C, R>) {
  return options
}

export function createStateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
>(options: StateDesignerConfig<D, A, C, R>, id = "0") {
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
  R extends ResultsCollection<D> | undefined
> {
  id = uniqueId()
  private _initialData: D
  data: D
  namedFunctions: NamedFunctions<D, A, C, R>
  _rootOptions: any
  _initialGraph: Graph.Node
  _active: IStateNode<D, A, C, R>[] = []
  root: IStateNode<D, A, C, R>
  subscribers = new Set<Subscriber<D, A, C, R>>([])
  pendingSend: [string, any][] = []

  private record: EventRecord<D> = {
    send: false,
    action: false,
    transition: undefined,
    transitions: 0
  }

  constructor(options = {} as StateDesignerConfig<D, A, C, R>) {
    const {
      data,
      initial,
      states = {},
      on = {},
      onEvent,
      actions,
      conditions,
      results
    } = options

    if (data === undefined) {
      this.data = data as D
    } else {
      this.data = data as D
    }

    this.namedFunctions = {
      actions,
      conditions,
      results
    }

    this.root = new IStateNode({
      machine: this,
      on,
      onEvent,
      states,
      initial,
      name: "root",
      active: true
    })

    this._initialData = this.data

    this._rootOptions = {
      machine: this,
      on,
      onEvent,
      states,
      initial,
      name: "root",
      active: true
    }

    this.root = new IStateNode(this._rootOptions)
    this._active = this.root.getActive()
    this._initialGraph = this.getGraphNode(this.root)

    for (let state of this._active) {
      if (state.autoEvents.onEnter !== undefined) {
        this.triggerAutoEvent(state, "onEnter", undefined, undefined)
      }

      if (state.autoEvents.onRepeat !== undefined) {
        this.triggerAutoEvent(state, "onRepeat", undefined, undefined)
      }
    }
  }

  private getGraphNode(state: IStateNode<D, A, C, R>): Graph.Node {
    return {
      name: state.name,
      active: state.active,
      initial: state.parent
        ? state.parent.type === "branch" && state.parent.initial === state.name
        : true,
      autoEvents: getGraphAutoEvents(state),
      events: getEvents(state),
      states:
        state.type === "leaf"
          ? undefined
          : state.children.map((child: any) => this.getGraphNode(child))
    }
  }

  /**
   * Share certain information with each of the machine's subscribers.
   */
  private notifySubscribers = () => {
    this.subscribers.forEach(subscriber =>
      subscriber(this.data, this.active, this.graph, this.root)
    )
  }

  /**
   * Adds an `onChange` callback to the machine's subscribers. This `onChange` callback will be called whenever the machine changes its data or graph. Returns a second callback to unsubscribe that callback. (This is makes out hook pretty.)
   */
  subscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  /**
   * Remove an `onChange` callback from the machine's subscribers.
   */
  unsubscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.delete(onChange)
  }

  /**
   * Resets the machine to its initial state.
   */
  reset = () => {
    // Restore data
    this.data = this._initialData

    // Rebuild state tree
    this.root = new IStateNode(this._rootOptions)

    // Notify subscribers
    this.notifySubscribers()
  }

  /**
   * Can the machine respond to a given event?
   */
  can = (event: string, payload?: any): boolean => {
    return produce(this.data, draft => {
      for (let state of this._active) {
        let eventHandlers = state.events[event]
        if (eventHandlers !== undefined) {
          for (let handler of eventHandlers) {
            let result: any
            for (let resolver of handler.get) {
              result = resolver(draft, payload, result)
            }

            if (state.canEventHandlerRun(handler, draft, payload, result)) {
              return true
            }
          }
        }
      }

      return false
    })
  }

  /**
   * Is the machine in the given state name?
   */
  isIn = (name: string) => {
    return this._active.find(v => v.path.endsWith("." + name)) ? true : false
  }

  get state() {
    return this.root
  }

  get graph() {
    return this.getGraphNode(this.root)
  }

  get active() {
    return this._active.map(s => s.name).slice(1)
  }

  // From here on, it's all event handling and state transition stuff

  send = (eventName: string, payload: any) => {
    this.resetRecord()

    const dataResult = produce(this.data, draft => {
      for (let state of this._active) {
        if (this.record.send || this.record.transition) break

        this.handleEvent(state, state.events[eventName], draft, payload)

        if (this.record.transition !== undefined) {
          while (this.record.transition !== undefined) {
            this.enactTransition(this.record.transition, draft, payload)
          }

          break
        }
      }
    })

    if (this.record.transitions > 0 || this.record.action || this.record.send) {
      this.resetRecord()
      this.data = dataResult
      this._active = this.root.getActive()

      const next = this.pendingSend.shift()

      if (next !== undefined) {
        const [e, p] = next
        this.send(e, p)
        return
      }

      this.notifySubscribers()
    }
  }

  resetRecord = () => {
    this.record = {
      send: false,
      action: false,
      transition: undefined,
      transitions: 0
    }
  }

  handleEvent = (
    state: IStateNode<D, any, any, any>,
    event: IEvent<D> | undefined,
    draft: Draft<D>,
    payload: any,
    result?: any
  ) => {
    if (event === undefined) return
    for (let handler of event) {
      this.handleEventHandler(state, handler, draft, payload, result)
    }
  }

  handleEventHandler(
    state: IStateNode<D, any, any, any>,
    handler: IEventHandler<D>,
    draft: Draft<D>,
    payload: any,
    result?: any
  ) {
    const {
      do: actions,
      get: resolvers,
      await: asyncItem,
      to: transition,
      send
    } = handler

    for (let resolver of resolvers) {
      result = resolver(draft, payload, result)
    }

    if (!state.canEventHandlerRun(handler, draft, payload, result)) {
      return
    }

    for (let action of actions) {
      this.record.action = true
      action(draft, payload, result)
    }

    if (asyncItem !== undefined) {
      this.handleAsyncItem(state, asyncItem, draft, payload, result)
      return
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
      this.pendingSend.push(send)
    } else {
      this.pendingSend.push([send, undefined])
    }
  }

  handleTransitionItem(
    state: IStateNode<D, any, any, any>,
    transition: string
  ) {
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
        target
      }
    }
  }

  enactTransition(
    transition: TransitionRecord<D>,
    draft: Draft<D>,
    payload: any
  ) {
    this.record.transitions++

    if (this.record.transitions > 100) {
      this.record.transition = undefined
      return
    }

    const { target, previous, restore } = transition
    const { onEnter, onRepeat } = target.autoEvents

    target.active = true

    const downChanges = target.activateDown(previous, restore)

    this.handleChanges(
      target,
      downChanges,
      false,
      previous,
      restore,
      draft,
      payload
    )

    const upChanges = target.activateUp()

    this.handleChanges(
      target,
      upChanges,
      true,
      previous,
      restore,
      draft,
      payload
    )

    this.record.transition = undefined

    if (onEnter !== undefined) {
      this.triggerAutoEvent(target, "onEnter", payload, undefined)
    }

    if (onRepeat !== undefined) {
      this.triggerAutoEvent(target, "onRepeat", payload, undefined)
    }
  }

  handleChanges(
    target: IStateNode<D, any, any, any>,
    results: IStateNode<D, any, any, any>[][],
    andUp: boolean,
    previous: boolean,
    restore: boolean,
    draft: Draft<D>,
    payload: any
  ) {
    const [activateDowns, deactivates] = results

    for (let state of deactivates) {
      state.deactivate()
    }

    for (let state of activateDowns) {
      state.active = true

      const { onEnter } = state.autoEvents
      if (onEnter !== undefined) {
        this.triggerAutoEvent(target, "onEnter", payload, undefined)
      }

      const { onRepeat } = state.autoEvents
      if (onRepeat !== undefined) {
        this.triggerAutoEvent(target, "onRepeat", payload, undefined)
      }

      if (this.record.transition !== undefined) {
        this.enactTransition(this.record.transition, draft, payload)
      }

      const downChanges = state.activateDown(previous, restore)
      this.handleChanges(
        target,
        downChanges,
        false,
        previous,
        restore,
        draft,
        payload
      )

      if (andUp && state.parent !== undefined) {
        if (!state.parent.active) {
          // Activate the parent state
          state.parent.active = true
          this.handleChanges(
            state,
            state.activateUp(),
            true,
            previous,
            restore,
            draft,
            payload
          )
        }
      }
    }
  }

  handleAsyncItem(
    state: IStateNode<D, any, any, any>,
    asyncItem: <T>(data: Draft<D>, payload: any, result: any) => Promise<T>,
    draft: Draft<D>,
    payload: any,
    result: any
  ) {
    asyncItem(draft, payload, result)
      .then(resolved => {
        if (state.active) {
          if (state.autoEvents.onResolve) {
            this.triggerAutoEvent(state, "onResolve", payload, resolved)
          }
        }
      })
      .catch(rejected => {
        if (state.active) {
          if (state.autoEvents.onReject) {
            this.triggerAutoEvent(state, "onReject", payload, rejected)
          }
        }
      })
  }

  triggerAutoEvent = async (
    state: IStateNode<D, any, any, any>,
    eventName: string,
    payload: any,
    returned: any
  ) => {
    const event = state.autoEvents[eventName]

    if (event.length === 1 && event[0].wait > 0) {
      await new Promise(resolve => setTimeout(resolve, event[0].wait * 1000))
    }

    if (!state.active) {
      return
    }

    this.resetRecord()
    const dataResult = produce(this.data, draft => {
      this.handleEvent(state, event, draft, payload, returned)

      if (this.record.transition !== undefined) {
        while (this.record.transition !== undefined) {
          this.enactTransition(this.record.transition, draft, payload)
        }
      }
    })

    if (this.record.transitions > 0 || this.record.action || this.record.send) {
      this.resetRecord()
      this.data = dataResult
      this._active = this.root.getActive()

      const next = this.pendingSend.shift()

      if (next !== undefined) {
        const [e, p] = next
        this.send(e, p)
        return
      }

      this.notifySubscribers()
    }

    if (eventName === "onRepeat") {
      const delay = Math.max(event[0].repeatDelay, 0.016)
      if (event.length === 1 && delay) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
      }

      this.triggerAutoEvent(state, "onRepeat", payload, undefined)
    }
  }

  // End old stuff
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
  Parallel = "parallel"
}

type StateConfig<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> = {
  name: string
  parent?: IStateNode<D, A, C, R>
  machine: StateDesigner<D, A, C, R>
  onEnter?: IEventConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  onResolve?: IEventConfig<D, A, C, R>
  onReject?: IEventConfig<D, A, C, R>
  onRepeat?: IEventConfig<D, A, C, R>
  on?: IEventsConfig<D, A, C, R>
  active: boolean
  initial?: string
  states?: IStatesConfig<D, A, C, R>
}

export class IStateNode<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
> {
  name: string
  path: string
  active = false
  machine: StateDesigner<D, A, C, R>
  parent?: IStateNode<D, A, C, R>
  type: StateType
  initial?: string
  previous?: string
  children: IStateNode<D, A, C, R>[] = []
  events: IEvents<D> = {}
  autoEvents: {
    onEvent?: IEvent<D>
    onEnter?: IEvent<D>
    onResolve?: IEvent<D>
    onReject?: IEvent<D>
    onRepeat?: IEvent<D>
  }

  constructor(options = {} as StateConfig<D, A, C, R>) {
    const {
      machine,
      parent,
      on = {},
      name,
      initial,
      states = {},
      onEvent,
      onEnter,
      onResolve,
      onReject,
      onRepeat,
      active
    } = options

    this.machine = machine

    this.parent = parent

    this.active = active

    this.name = name

    this.path = this.parent ? this.parent.path + "." + name : this.name

    // CHILDREN

    this.initial = initial

    this.children = Object.keys(states).reduce<IStateNode<D, A, C, R>[]>(
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
            onEvent: state.onEvent,
            onResolve: state.onResolve,
            onReject: state.onReject,
            onRepeat: state.onRepeat,
            on: state.on
          })
        )
        return acc
      },
      []
    )

    // INITIAL STATE

    if (this.initial !== undefined) {
      const initialState = this.children.find(v => v.name === this.initial)
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
        const parts = item.toString().match(/\((.*)\) {\n([^}]*)}/)

        if (parts === null) return bindToMachine(item)

        return item as IAction<D>

        //         return Function(
        //           `return function custom(${parts[1]}) {
        // ${parts[2]}}`
        // )() as IAction<D>
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
        const parts = item.toString().match(/\((.*)\) {\n([^}]*)}/)

        if (parts === null) return bindToMachine(item)

        return Function(
          `return function custom(${parts[1]}) {
${parts[2]}}`
        )() as ICondition<D>
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
        const parts = item.toString().match(/\((.*)\) {\n([^}]*)}/)

        if (parts === null) return bindToMachine(item)

        return Function(
          `return function custom(${parts[1]}) {
${parts[2]}}`
        )() as IResult<D>
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

    const getProcessedEventHandler = (event: IEventConfig<D, A, C, R>) => {
      const handlers = castArray(event as any)

      return handlers.map<IEventHandler<D>>(v => {
        let result: IEventHandler<D> = {
          get: [],
          if: [],
          unless: [],
          ifAny: [],
          do: [],
          send: undefined,
          to: undefined
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
          result.to = v.to
          result.send = v.send
          result.await = v.await
          result.repeatDelay = v.repeatDelay
          result.wait = v.wait
        }

        return result
      })
    }

    // AUTO EVENTS

    this.autoEvents = {
      onEvent: onEvent ? getProcessedEventHandler(onEvent) : undefined,
      onEnter: onEnter ? getProcessedEventHandler(onEnter) : undefined,
      onResolve: onResolve ? getProcessedEventHandler(onResolve) : undefined,
      onReject: onReject ? getProcessedEventHandler(onReject) : undefined,
      onRepeat: onRepeat ? getProcessedEventHandler(onRepeat) : undefined
    }

    this.events = Object.keys(on).reduce<IEvents<D>>((acc, key) => {
      acc[key] = getProcessedEventHandler(on[key])
      return acc
    }, {})
  }

  getTargetFromTransition = (
    transition: string,
    state: IStateNode<D, A, C, R>
  ): IStateNode<D, A, C, R> | undefined => {
    let target: IStateNode<D, A, C, R> | undefined = undefined

    if (transition.includes(".")) {
      let source = state
      let path = transition.split(".")
      for (let step of path) {
        const next = source.children.find(v => v.name === step)
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
      const next = state.children.find(v => v.name === transition)
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
    const activateDowns: IStateNode<D, A, C, R>[] = []
    const deactivates: IStateNode<D, A, C, R>[] = []

    switch (this.type) {
      case StateType.Branch: {
        // Find the child to activate
        const activeChild =
          previous || restore
            ? this.children.find(v => v.name === this.previous)
            : this.children.find(v => v.name === this.initial)

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
    const activateDowns: IStateNode<D, A, C, R>[] = []
    const deactivates: IStateNode<D, A, C, R>[] = []

    const parent = this.parent as IStateNode<D, A, C, R>

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
    draft: Draft<D>,
    payload: any,
    result: any
  ) => {
    // --- Conditions

    // Every `if` condition must return true
    if (
      handler.if.length > 0 &&
      !handler.if.every(c => c(draft, payload, result))
    )
      return false

    // Every `unless` condition must return false
    if (
      handler.unless.length > 0 &&
      handler.unless.some(c => c(draft, payload, result))
    )
      return false

    // One or more `ifAny` conditions must return true
    if (
      handler.ifAny.length > 0 &&
      !handler.ifAny.some(c => c(draft, payload, result))
    )
      return false

    return true
  }

  public getActive = (): IStateNode<D, A, C, R>[] => {
    if (!this.active) {
      return []
    }

    return [
      this,
      ...this.children.reduce<IStateNode<D, A, C, R>[]>((acc, child) => {
        acc.push(...child.getActive())
        return acc
      }, [])
    ]
  }
}

export default StateDesigner

const Errors = {
  noNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s.`,
  noMatchingNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s with that name.`
}

export type StateDesignerWithConfig<
  C extends StateDesignerConfig<any, any, any, any>
> = StateDesigner<C["data"], C["actions"], C["conditions"], C["results"]>

export type EventRecord<D> = {
  send: boolean
  action: boolean
  transition?: TransitionRecord<D>
  transitions: number
}

type TransitionRecord<D> = {
  target: IStateNode<D, any, any, any>
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
  selected: "cat"
})

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

// function transformObject<
//   T extends { [key: string]: any },
//   K extends keyof T,
//   U extends any
// >(source: T, callbackFn: (value: T[K], index: number) => U): { K: U } {
//   return Object.fromEntries(
//     Object.entries(source).map((value, index) => [
//       value[0],
//       callbackFn(value[1], index)
//     ])
//   ) as { K: U }
// }

function getGraphHandlerItem<D>(item: ValuesType<IEventHandler<unknown>>) {
  if (Array.isArray(item)) {
    return (item as any).map(
      (thing: IAction<unknown> | ICondition<unknown> | IResult<unknown>) => ({
        name: thing.name,
        code: thing.toString()
      })
    )
  } else {
    return item
  }
}

function getEvent(event: IEvent<unknown>): Graph.Event {
  return event.map(eventHandler => {
    const graphHandler = {} as Graph.EventHandler

    for (let key in eventHandler) {
      const item = eventHandler[key]
      graphHandler[key] = getGraphHandlerItem(item)
    }

    return graphHandler
  })
}

function getGraphAutoEvents(state: IStateNode<any, any, any, any>) {
  const autoEvents = {} as Graph.AutoEvents

  for (let eventName of [
    "onEnter",
    "onEvent",
    "onResolve",
    "onReject",
    "onRepeat"
  ]) {
    let event = state.autoEvents[eventName] as IEvent<unknown> | undefined

    if (event !== undefined) {
      autoEvents[eventName] = getEvent(event)
    }
  }

  return autoEvents
}

function getEvents(state: IStateNode<any, any, any, any>) {
  const events = {} as Graph.Events

  for (let eventName in state.events) {
    const event = state.events[eventName]
    events[eventName] = getEvent(event)
  }

  return events
}
