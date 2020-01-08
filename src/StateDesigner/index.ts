import { castArray, uniqueId } from "lodash-es"
import produce, { Draft } from "immer"

type NamedOrInSeries<T, K> = keyof K | T | (keyof K | T)[]

// Actions

export type IAction<D> = (data: Draft<D>, payload: any, result: any) => any

export type IActionConfig<D> = (data: D, payload: any, result: any) => any

export type IActionsConfig<D, A> = NamedOrInSeries<IActionConfig<D>, A>

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

type IConditionsConfig<D, A> = NamedOrInSeries<IConditionConfig<D>, A>

// Results

export type IResult<D> = (data: D | Draft<D>, payload: any, result: any) => any

export type IResultConfig<D> = (
  data: D | Draft<D>,
  payload: any,
  result: any
) => void

type IResultsConfig<D, R> = NamedOrInSeries<IResultConfig<D>, R>

// Computed values

// Event Handlers (Config)

interface IEventHandlerConfig<D, A, C, R> {
  do?: IActionsConfig<D, A>
  if?: IConditionsConfig<D, C>
  ifAny?: IConditionsConfig<D, C>
  unless?: IConditionsConfig<D, C>
  get?: IResultsConfig<D, R>
  to?: string
  wait?: number
}

type IEventHandlersConfig<D, A, C, R> =
  | IEventHandlerConfig<D, A, C, R>
  | IEventHandlerConfig<D, A, C, R>[]

type IEventConfig<D, A, C, R> =
  | IActionsConfig<D, A>
  | IEventHandlersConfig<D, A, C, R>

type IEventsConfig<D, A, C, R> = Record<string, IEventConfig<D, A, C, R>>

// Event Handlers (final)

interface IEventHandler<D> {
  do: IAction<D>[]
  if: ICondition<D>[]
  ifAny: ICondition<D>[]
  unless: ICondition<D>[]
  get: IResult<D>[]
  to?: string
  wait?: number
}

type IEvent<D> = IEventHandler<D>[]

type IEvents<D> = Record<string, IEvent<D>[]>

// Named functions

type NamedFunctions<A, C, R> = {
  actions?: A
  conditions?: C
  results?: R
}

// States

interface IStateConfig<D, A, C, R> {
  on?: IEventsConfig<D, A, C, R>
  onEnter?: IEventConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  states?: IStatesConfig<D, A, C, R>
  initial?: string
}

type IStatesConfig<D, A, C, R> = Record<string, IStateConfig<D, A, C, R>>

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

// Machine subscriber

type Subscriber<
  D extends any,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
> = (active: string[], data: D, state: IStateNode<D, A, C, R>) => void

// Machine configuration

export interface StateDesignerConfig<
  D extends any,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
> {
  data: D
  on?: IEventsConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  initial?: string
  states?: IStatesConfig<D, A, C, R>
  actions?: A
  conditions?: C
  results?: R
}

export function createStateDesignerConfig<
  D extends any,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
>(options: StateDesignerConfig<D, A, C, R>) {
  return options
}

export function createStateDesigner<
  D extends any,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
>(options: StateDesignerConfig<D, A, C, R>) {
  return new StateDesigner(options)
}

/* --------------------- Machine -------------------- */

class StateDesigner<
  D extends any,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
> {
  id = uniqueId()
  data: D
  namedFunctions: NamedFunctions<A, C, R>
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

    this.data = data

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

    this._active = this.root.getActive()
  }

  get active() {
    return this._active.map(s => s.name).slice(1)
  }

  private notifySubscribers = () => {
    this.subscribers.forEach(subscriber =>
      subscriber(this.active, this.data, this.root)
    )
  }

  subscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  unsubscribe = (onChange: Subscriber<D, A, C, R>) => {
    this.subscribers.delete(onChange)
  }

  send = (event: string, payload?: any) => {
    let didRunAction = false
    let didTransition = false

    const dataResult = produce(this.data, draft => {
      function handleEventHandlers(
        state: IStateNode<D, A, C, R>,
        events: IEvent<D>[]
      ) {
        if (didTransition) return
        if (events === undefined) return

        for (let event of events) {
          for (let handler of event) {
            let result = {}

            // --- Results

            for (let resolver of handler.get) {
              result = resolver(draft, payload, result)
            }

            // --- Conditions

            if (!state.canEventHandlerRun(handler, draft, payload, result))
              continue

            // --- Actions

            for (let action of handler.do) {
              didRunAction = true
              action(draft, payload, result)
            }

            // --- Transition

            let { to: transition } = handler

            if (transition === undefined) continue

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

            // No target found in the active tree!
            // This is a bug in the user's configuration
            if (target === undefined) continue

            // Ignore transitions to an already-active state
            if (target.active) continue

            // Make the transition and cancel the rest
            // of this event chain
            target.activate(previous, restore)

            const { onEnter } = target.autoEvents
            if (onEnter !== undefined) {
              handleEventHandlers(state, onEnter)
            }

            didTransition = true
            return
          }
        }
      }

      // Loop through each state, starting from the
      // root and moving doward, handling the event
      // at each level. Note that any transition will
      // cause all future handlers to bail immediately.
      for (let state of this._active) {
        let eventHandlers = state.events[event]

        handleEventHandlers(state, eventHandlers)

        const { onEvent } = state.autoEvents

        if (onEvent !== undefined) {
          handleEventHandlers(state, onEvent)
        }
      }
    })

    if (didTransition || didRunAction) {
      this.data = dataResult
      this._active = this.root.getActive()
      this.notifySubscribers()
    }
  }

  can = (event: string, payload?: any): boolean => {
    return produce(this.data, draft => {
      for (let state of this._active) {
        let events = state.events[event]
        if (events !== undefined) {
          for (let event of events) {
            let result: any
            for (let handler of event) {
              for (let resolver of handler.get) {
                result = resolver(draft, payload, result)
              }

              if (state.canEventHandlerRun(handler, draft, payload, result)) {
                return true
              }
            }
          }
        }
      }

      return false
    })
  }

  isIn = (name: string) => {
    return this._active.find(v => v.path.endsWith(name)) ? true : false
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

type StateConfig<
  D,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
> = {
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

class IStateNode<
  D,
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
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
    onEvent?: IEvent<D>[]
    onEnter?: IEvent<D>[]
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
            active: this.initial === undefined ? true : cur === this.initial,
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

    const getProcessedEventHandler = (
      eventHandler: IEventConfig<D, A, C, R>
    ) => {
      const handlers = castArray(eventHandler)

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

    const getProcessedEvent = (event: IEventConfig<D, A, C, R>) => {
      return castArray(event).map<IEvent<D>>(getProcessedEventHandler)
    }

    // AUTO EVENTS

    this.autoEvents = {
      onEvent: onEvent ? getProcessedEvent(onEvent) : undefined,
      onEnter: onEnter ? getProcessedEvent(onEnter) : undefined
    }

    this.events = Object.keys(on).reduce<IEvents<D>>((acc, key) => {
      acc[key] = getProcessedEvent(on[key])
      return acc
    }, {})
  }

  getTargetFromTransition = (
    transition: string,
    state: IStateNode<D, A, C, R>
  ): IStateNode<D, A, C, R> | undefined => {
    // handle transition (rough draft)
    const target = state.children.find(v => v.name === transition)
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
    switch (this.type) {
      case StateType.Branch: {
        // Find the child to activate
        const activeChild =
          previous || restore
            ? this.children.find(v => v.name === this.previous)
            : this.children.find(v => v.name === this.initial)

        if (activeChild === undefined) {
          throw new Error("Active child does not exist!")
        }

        for (let state of this.children) {
          // Activate active child and de-activate others
          if (state === activeChild) {
            this.previous = activeChild.name
            activeChild.activateDown(restore, restore)
          } else if (state.active) {
            state.deactivate()
          }
        }
        break
      }
      case StateType.Parallel: {
        // Activate children
        for (let child of this.children) {
          child.activateDown(restore, restore)
        }
        break
      }
      default: {
        break
      }
    }
  }

  activateUp = () => {
    if (this.parent === undefined) return

    this.parent.active = true

    switch (this.parent.type) {
      case StateType.Branch: {
        this.parent.previous = this.name
        // Deactivate siblings
        for (let sib of this.parent.children) {
          if (sib === this) continue
          if (sib.active) {
            sib.deactivate()
          }
        }
        break
      }
      case StateType.Parallel: {
        for (let sib of this.parent.children) {
          // Activate siblings
          if (sib === this) continue
          if (!sib.active) {
            sib.activateDown()
          }
        }
      }
      default: {
        break
      }
    }

    this.parent.activateUp()
  }

  activate = (previous = false, restore = false) => {
    if (this.active) {
      throw new Error("Tried to activate an active state!")
    }

    this.active = true
    this.activateDown(previous, restore)
    this.activateUp()
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

// use create statedesignerconfig
// get typeof result

// const tConfig = createStateDesignerConfig({
//   data: {
//     toggled: false
//   }
// })

// type ToggleMachine = StateDesignerWithConfig<typeof tConfig>
