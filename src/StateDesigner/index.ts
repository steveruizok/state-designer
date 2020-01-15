import castArray from "lodash/castArray"
import uniqueId from "lodash/uniqueId"
import produce, { Draft } from "immer"

// type WithoutNamed<T> = T | T[]
// type NamedOrInSeries<T, U> = keyof U | T | (keyof U | T)[]

// Actions

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
export type CA<D> = Record<string, IActionConfig<D>>
export type CAs<D> = CA<D> | undefined
export type CC<D> = Record<string, IConditionConfig<D>>
export type CCs<D> = CC<D> | undefined
export type CR<D> = Record<string, IResultConfig<D>>
export type CRs<D> = CR<D> | undefined

// Handler configurations

export type IActionsConfig<D, A> = A extends undefined
  ? IActionConfig<D> | IActionConfig<D>[]
  : keyof A | IActionConfig<D> | (keyof A | IActionConfig<D>)[]

export type IConditionsConfig<D, C> = C extends undefined
  ? IConditionConfig<D> | IConditionConfig<D>[]
  : keyof C | IConditionConfig<D> | (keyof C | IConditionConfig<D>)[]

export type IResultsConfig<D, R> = R extends undefined
  ? IResultConfig<D> | IResultConfig<D>[]
  : keyof R | IResultConfig<D> | (keyof R | IResultConfig<D>)[]

// Event Handlers (Config)

interface IEventHandlerConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> {
  do?: IActionsConfig<D, A>
  if?: IConditionsConfig<D, C>
  ifAny?: IConditionsConfig<D, C>
  unless?: IConditionsConfig<D, C>
  get?: IResultsConfig<D, R>
  to?: string
  wait?: number
}

//undefined extends A
// ? IActionConfig<D> | IActionConfig<D>[]
// : keyof A | IActionConfig<D> | (keyof A | IActionConfig<D>)[]

export type IEventWithoutActions<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> =
  | (IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)
  | (IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)[]

export type IEventWithActions<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> =
  | (keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)
  | (keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)[]

export type IEventConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> = A extends CA<D>
  ?
      | (keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)
      | (keyof A | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)[]
  :
      | (IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)
      | (IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)[]

// :
//     | K
//     | IActionConfig<D>
//     | IEventHandlerConfig<D, A, C, R>
//     | (K | IActionConfig<D> | IEventHandlerConfig<D, A, C, R>)[]

export type IEventsConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> = Record<string, IEventConfig<D, A, C, R>>

// Event Handlers (final)

export interface IEventHandler<D> {
  do: IAction<D>[]
  if: ICondition<D>[]
  ifAny: ICondition<D>[]
  unless: ICondition<D>[]
  get: IResult<D>[]
  to?: string
  wait?: number
}

type IEvent<D> = IEventHandler<D>[]

type IEvents<D> = Record<string, IEvent<D>>

// Named functions

type NamedFunctions<D, A extends CAs<D>, C extends CCs<D>, R extends CRs<D>> = {
  actions?: A
  conditions?: C
  results?: R
}

// States

export interface IStateConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> {
  on?: IEventsConfig<D, A, C, R>
  onEnter?: IEventConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  states?: IStatesConfig<D, A, C, R>
  initial?: string
}

export type IStatesConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> = Record<string, IStateConfig<D, A, C, R>>

// Graph

export interface GraphNode {
  name: string
  active: boolean
  initial: boolean
  autoEvents: string[]
  events: string[]
  states?: GraphNode[]
}

// Machine subscriber

export type Subscriber<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> = (
  active: string[],
  data: D,
  graph: GraphNode,
  state: IStateNode<D, A, C, R>
) => void

// State Designer Config

export interface StateDesignerConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
> {
  data?: D
  on?: IEventsConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  initial?: string
  states?: IStatesConfig<D, A, C, R>
  actions?: A
  conditions?: C
  results?: R
}

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

export function createStateDesignerConfig<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
>(options: StateDesignerConfig<D, A, C, R>) {
  return options
}

export function createStateDesigner<
  D,
  A extends CAs<D>,
  C extends CCs<D>,
  R extends CRs<D>
>(options: StateDesignerConfig<D, A, C, R>) {
  return new StateDesigner(options)
}

/* --------------------- Machine -------------------- */

class StateDesigner<D, A extends CAs<D>, C extends CCs<D>, R extends CRs<D>> {
  id = uniqueId()
  private _initialData: D
  data: D
  namedFunctions: NamedFunctions<D, A, C, R>
  _rootOptions: any
  _initialGraph: GraphNode
  _active: IStateNode<D, A, C, R>[] = []
  root: IStateNode<D, A, C, R>
  subscribers = new Set<Subscriber<D, A, C, R>>([])

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
  }

  get active() {
    return this._active.map(s => s.name).slice(1)
  }

  private getGraphNode(state: IStateNode<D, A, C, R>): GraphNode {
    return {
      name: state.name,
      active: state.active,
      initial: state.parent
        ? state.parent.type === "branch" && state.parent.initial === state.name
        : true,
      autoEvents: Object.keys(state.autoEvents).filter(
        k => state.autoEvents[k] !== undefined
      ),
      events: Object.keys(state.events),
      states:
        state.type === "leaf"
          ? undefined
          : state.children.map((child: any) => this.getGraphNode(child))
    }
  }

  get graph() {
    return this.getGraphNode(this.root)
  }

  /**
   * ## Reset
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
   * ## Subscribe
   * Adds an `onChange` callback to the machine's subscribers. This `onChange` callback will be called whenever the machine changes its data or graph. Returns a second callback to unsubscribe that callback. (This is makes out hook pretty.)
   */
  subscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  /**
   * ## Unsubscribe
   * Remove an `onChange` callback from the machine's subscribers.
   */
  unsubscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.delete(onChange)
  }

  /**
   * ## Notify Subscribers
   * Share certain information with each of the machine's subscribers.
   */
  private notifySubscribers = () => {
    this.subscribers.forEach(subscriber =>
      subscriber(this.active, this.data, this.graph, this.root)
    )
  }

  /**
   * ## Handle Event
   * Run through all of the event handlers associated with an event. An event has an array of event handlers, each with many event handler items. This function is where we figure out what those events are going to do.   * @param state The state that the event handlers belong to.
   * @param data The current data draft.
   * @param payload The current payload.
   * @param events All of the events to attempt.
   */
  private handleEvent(
    state: IStateNode<D, A, C, R>,
    data: Draft<D>,
    payload: any,
    event: IEvent<D>
  ) {
    const record: EventRecord = {
      action: false
    }

    if (event === undefined) {
      // No events, no problem
      return record
    }

    for (let handler of event) {
      let result = {}

      // --- Results

      for (let resolver of handler.get) {
        result = resolver(data, payload, result)
      }

      // --- Conditions

      if (!state.canEventHandlerRun(handler, data, payload, result)) continue

      // --- Actions

      for (let action of handler.do) {
        record.action = true
        action(data, payload, result)
      }

      // --- Transition

      let { to: transition } = handler

      if (transition === undefined) continue

      let previous = false
      let restore = false

      // Strip off the modifiers (previous or restore) and
      // set those boolean flags
      if (transition.endsWith(".previous")) {
        previous = true
        transition = transition.substring(0, transition.length - 9)
      } else if (transition.endsWith(".restore")) {
        previous = true
        restore = true
        transition = transition.substring(0, transition.length - 8)
      }

      const target = state.getTargetFromTransition(transition, state)

      // No target found in the active tree!
      // This is probably a bug in the user's configuration: either
      // they have a name wrong or the state they're reaching for
      // requires a "deep link", e.g. "myState.myOtherState"
      if (target === undefined) continue

      // Update the record
      record.transition = {
        previous,
        restore,
        target
      }

      // Return the record. A transition stops the event chain.
      // Any events left after here will get ignored.
      return record
    }

    // This code will only run if there hasn't been any transitions
    // in the event chain. In that case, we just return the record!
    return record
  }

  send = (eventName: string, payload?: any) => {
    let record: EventRecord = {
      action: false
    }

    let transitions = 0

    function mergeRecord(next: EventRecord | undefined) {
      if (!next) return
      if (next.action) record.action = true
      if (next.transition !== undefined) record.transition = next.transition
    }

    const dataResult = produce(this.data, draft => {
      // Loop through each state, starting from the
      // root and moving doward, handling the event
      // at each level. Note that any transition will
      // cause all future handlers to bail immediately.

      // We're going to start handling transitions, and each of these
      // may have an auto event (onEnter, onEvent) that causes a further
      // transition.

      const handleTransition = (next: TransitionRecord) => {
        transitions++

        if (transitions > 100) {
          console.error(
            "Either you have a transition loop or you're trying to do something too clever!"
          )
          return
        }

        const { target, previous, restore } = next

        // Activate the new state
        // target.activate(previous, restore)
        target.active = true

        const handleChanges = (
          results: IStateNode<D, A, C, R>[][],
          andUp: boolean
        ) => {
          const [activateDowns, deactivates] = results

          for (let state of deactivates) {
            state.deactivate()
          }

          for (let state of activateDowns) {
            state.active = true
            const { onEnter } = state.autoEvents

            if (onEnter !== undefined) {
              mergeRecord(this.handleEvent(target, draft, payload, onEnter))
              if (record.transition !== undefined) {
                handleTransition(record.transition)
              }
            }

            handleChanges(state.activateDown(previous, restore), andUp)

            if (andUp && state.parent !== undefined) {
              if (!state.parent.active) {
                state.parent.active = true
                handleChanges(state.activateUp(), true)
              }
            }
          }
        }

        handleChanges(target.activateDown(previous, restore), false)
        handleChanges(target.activateUp(), true)

        record.transition = undefined

        // TODO: Activate up the tree here (so that we can run auto events)
        // TODO: Activate down the tree here (so that we can run auto events)

        // Handle the transition events (this might produce a new next)
        const { onEnter } = target.autoEvents

        // There's a risk of ping-ponging infinitely between states.
        if (onEnter !== undefined) {
          mergeRecord(this.handleEvent(target, draft, payload, onEnter))
          if (record.transition !== undefined) {
            handleTransition(record.transition)
          }
        }
      }

      for (let state of this._active) {
        let event = state.events[eventName]

        mergeRecord(this.handleEvent(state, draft, payload, event))

        // A transition will halt our iterating through active states.
        // Any states below the transition won't be analyzed -- their
        // events with this name, if any exist, will get ignored. Be
        // careful about sharing event names if one or more involve
        // transitions!
        if (record.transition !== undefined) {
          handleTransition(record.transition)
          break
        } else {
          const { onEvent } = state.autoEvents
          if (onEvent !== undefined) {
            mergeRecord(this.handleEvent(state, draft, payload, onEvent))
            if (record.transition !== undefined) {
              handleTransition(record.transition)
              break
            }
          }
        }
      }
    })

    if (transitions > 0 || record.action) {
      this.data = dataResult
      this._active = this.root.getActive()
      this.notifySubscribers()
    }
  }

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

  isIn = (name: string) => {
    return this._active.find(v => v.path.endsWith("." + name)) ? true : false
  }

  get state() {
    return this.root
  }
}

/* ------------------- State Node ------------------- */

enum StateType {
  Leaf = "leaf",
  Branch = "branch",
  Parallel = "parallel"
}

type StateConfig<D, A extends CAs<D>, C extends CCs<D>, R extends CRs<D>> = {
  name: string
  parent?: IStateNode<D, A, C, R>
  machine: StateDesigner<D, A, C, R>
  onEnter?: IEventConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  on?: IEventsConfig<D, A, C, R>
  active: boolean
  initial?: string
  states?: IStatesConfig<D, A, C, R>
}

class IStateNode<D, A extends CAs<D>, C extends CCs<D>, R extends CRs<D>> {
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

        return callback
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

        return callback
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

        return callback
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
        }

        return result
      })
    }

    // AUTO EVENTS

    this.autoEvents = {
      onEvent: onEvent ? getProcessedEventHandler(onEvent) : undefined,
      onEnter: onEnter ? getProcessedEventHandler(onEnter) : undefined
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
            // activeChild.activateDown(restore, restore)
            activateDowns.push(activeChild)
          } else if (state.active) {
            deactivates.push(state)
            // state.deactivate()
          }
        }
        break
      }
      case StateType.Parallel: {
        // Activate children
        activateDowns.push(...this.children)
        // for (let child of this.children) {
        //   child.activateDown(restore, restore)
        // }
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

    // this.parent.active = true
    const parent = this.parent as IStateNode<D, A, C, R>

    switch (parent.type) {
      case StateType.Branch: {
        parent.previous = this.name
        // Deactivate siblings
        for (let sib of parent.children) {
          if (sib === this) continue
          if (sib.active) {
            deactivates.push(sib)
            // sib.deactivate()
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
            // sib.activateDown()
          }
        }
      }
      default: {
        break
      }
    }

    return [activateDowns, deactivates]
    // this.parent.activateUp()
  }

  // activate = (previous = false, restore = false) => {
  //   this.active = true
  //   this.activateDown(previous, restore)
  //   this.activateUp()
  // }

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

  // handleEventHandler = (
  //   handler: IEventHandler<D>,
  //   draft: Draft<D>,
  //   payload: any,
  //   result: any
  // ) => {
  //   // --- Resolvers

  //   for (let resolver of handler.get) {
  //     result = resolver(draft, payload, result)
  //   }

  //   // --- Conditions

  //   if (!this.canEventHandlerRun(handler, draft, payload, result)) return draft

  //   // --- Actions
  //   for (let action of handler.do) {
  //     action(draft, payload, result)
  //   }

  //   return draft
  // }

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

type EventRecord = {
  action: boolean
  transition?: TransitionRecord
}

type TransitionRecord = {
  target: IStateNode<any, any, any, any>
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
