import { castArray, uniqueId } from "lodash-es"
import produce, { Draft } from "immer"

type NamedOrInSeries<T, K> = keyof K | T | (keyof K | T)[]

// Named Functions

// type INamedFunctions<T> = { [key: string]: T }

// Actions

export type IActionConfig<D> = (data: D, payload: any, result: any) => any

export type IAction<D> = (data: D, payload: any, result: any) => any

type IActions<D, A> = NamedOrInSeries<IAction<D>, A>

// Conditions

export type ICondition<D> = (
  data: Readonly<D>,
  payload: any,
  result: any
) => boolean

type IConditions<D, A> = NamedOrInSeries<ICondition<D>, A>

// Results

export type IResult<D> = (data: Readonly<D>, payload: any, result: any) => void

type IResults<D, A> = NamedOrInSeries<IResult<D>, A>

// Computed values

export type IComputedValue<D, K = any> = (data: Readonly<D>) => K

export type IComputedValues<D> = {
  [key: string]: IComputedValue<D>
}

export type IComputedValuesConfig<D> = { [key: string]: IComputedValue<D> }

export type IComputedReturnValues<C extends StateDesignerConfig> = {
  [key in keyof C["values"]]: ReturnType<C["values"][key]>
}

// Event Handlers (Config)

interface IEventHandlerConfig<D, A, C, R> {
  do?: IActions<D, A>
  if?: IConditions<D, C>
  ifAny?: IConditions<D, C>
  unless?: IConditions<D, C>
  get?: IResults<D, R>
  to?: string
  wait?: number
}

type IEventHandlersConfig<D, A, C, R> =
  | IEventHandlerConfig<D, A, C, R>
  | IEventHandlerConfig<D, A, C, R>[]

type IEventConfig<D, A, C, R> =
  | IActions<D, A>
  | IEventHandlersConfig<D, A, C, R>

type IEventsConfig<D, A, C, R> = Record<string, IEventConfig<D, A, C, R>>

// Event Handlers (final)

interface IEventHandler<C extends StateDesignerConfig> {
  do: IAction<C>[]
  if: ICondition<C>[]
  ifAny: ICondition<C>[]
  unless: ICondition<C>[]
  get: IResult<C>[]
  to?: string
  wait?: number
}

type IEvent<C extends StateDesignerConfig> = IEventHandler<C>[]

type IEvents<C extends StateDesignerConfig> = {
  [key: string]: IEvent<C>[]
}

// Named functions

type NamedFunctions<A, C, R> = {
  actions?: A
  conditions?: C
  results?: R
}

// States

interface IStateConfig<D, A, C, R> {
  on?: IEventsConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  states?: IStatesConfig<D, A, C, R>
  initial?: string
}

type IStatesConfig<D, A, C, R> = Record<string, IStateConfig<D, A, C, R>>

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

// Machine subscriber

type Subscriber<C extends StateDesignerConfig, S extends StateDesigner<C>> = (
  active: S["active"],
  data: S["data"],
  values: S["values"]
) => void

// Machine configuration

export interface StateDesignerConfig<
  D extends { [key: string]: any } = any,
  A extends Record<string, IAction<D>> = any,
  C extends Record<string, ICondition<D>> = any,
  R extends Record<string, IResult<D>> = any,
  V extends IComputedValuesConfig<D> = any
> {
  data: D
  on?: IEventsConfig<D, A, C, R>
  onEvent?: IEventConfig<D, A, C, R>
  initial?: string
  states?: IStatesConfig<D, A, C, R>
  actions?: A
  conditions?: C
  results?: R
  values?: V
}

export function createStateDesignerConfig<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>
>(options: StateDesignerConfig<D, A, C, R, V>) {
  return options
}

export function createStateDesignerData<D>(options: D) {
  return options
}

export function createStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>
>(config: StateDesignerConfig<D, A, C, R, V>) {
  return new StateDesigner(config)
}

/* --------------------- Machine -------------------- */

class StateDesigner<C extends StateDesignerConfig> {
  id = uniqueId()
  data: C["data"]
  namedFunctions: NamedFunctions<C["actions"], C["conditions"], C["results"]>
  valueFunctions: undefined extends C["values"] ? undefined : C["values"]
  values: undefined extends C["values"] ? undefined : IComputedReturnValues<C>
  active: IStateNode<C>[] = []
  root: IStateNode<C>
  subscribers = new Set<Subscriber<C, StateDesigner<C>>>([])

  constructor(options = {} as C) {
    const {
      data,
      initial,
      states = {},
      on = {},
      onEvent,
      values,
      actions,
      conditions,
      results
    } = options

    this.data = data

    this.valueFunctions = values as undefined extends C["values"]
      ? undefined
      : C["values"]

    if (values === undefined) {
      this.values = undefined as undefined extends C["values"]
        ? undefined
        : IComputedReturnValues<C>
    } else {
      this.values = Object.keys(values as C["values"]).reduce<
        IComputedReturnValues<C>
      >(
        (acc, key: keyof C["values"]) =>
          Object.assign(acc, { [key]: (values as C["values"])[key](data) }),
        {} as IComputedReturnValues<C>
      ) as undefined extends C["values"] ? undefined : IComputedReturnValues<C>
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

    this.active = this.root.getActive()
  }

  private getUpdatedValues = (
    valueFunctions: C["values"],
    draft: C["data"]
  ): undefined extends C["values"] ? undefined : IComputedReturnValues<C> => {
    return Object.keys(valueFunctions as C["values"]).reduce<
      IComputedReturnValues<C>
    >(
      (acc, key: keyof C["values"]) =>
        Object.assign(acc, {
          [key]: (valueFunctions as C["values"])[key](draft)
        }),
      {} as IComputedReturnValues<C>
    ) as undefined extends C["values"] ? undefined : IComputedReturnValues<C>
  }

  private notifySubscribers = () => {
    if (this.valueFunctions !== undefined) {
      this.values = this.getUpdatedValues(
        this.valueFunctions as C["values"],
        this.data
      )
    }

    this.subscribers.forEach(subscriber =>
      subscriber(this.active, this.data, this.values)
    )
  }

  subscribe = (onChange: Subscriber<C, StateDesigner<C>>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  unsubscribe = (onChange: Subscriber<C, StateDesigner<C>>) => {
    this.subscribers.delete(onChange)
  }

  send = (event: string, payload?: any) => {
    const reversedActiveStates = [...this.active].reverse()

    let result = {}

    this.data = produce(this.data, draft => {
      for (let state of reversedActiveStates) {
        // Move this to the state eventually
        let eventHandlers = state.events[event]
        if (eventHandlers === undefined) continue

        for (let eventHandler of eventHandlers) {
          for (let handler of eventHandler) {
            state.handleEventHandler(handler, draft, payload, result)

            let previous = false
            let restore = false

            let { to: transition } = handler

            if (transition !== undefined) {
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
                target.activate(previous, restore)
                break
              }
            }
          }
        }

        const { onEvent } = state.autoEvents

        if (onEvent !== undefined) {
          for (let eventHandler of onEvent) {
            for (let handler of eventHandler) {
              state.handleEventHandler(handler, draft, payload, result)

              let previous = false
              let restore = false

              let { to: transition } = handler

              if (transition !== undefined) {
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
                  target.activate(previous, restore)
                  break
                }
              }
            }
          }
        }
      }
    })

    this.active = this.root.getActive()
    this.notifySubscribers()
  }

  can = (event: string, payload?: any): boolean => {
    const reversedActiveStates = [...this.active].reverse()
    let result: any

    return produce(this.data, draft => {
      for (let state of reversedActiveStates) {
        let eventHandlers = state.events[event]
        if (eventHandlers !== undefined) {
          for (let eventHandler of eventHandlers) {
            for (let handler of eventHandler) {
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
    return this.active.find(v => v.path.endsWith(name))
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

interface IStateNodeConfig<C extends StateDesignerConfig> {
  name: string
  parent?: IStateNode<C>
  active: boolean
  on?: IEventsConfig<C["data"], C["actions"], C["conditions"], C["results"]>
  onEvent?: IEventConfig<C["data"], C["actions"], C["conditions"], C["results"]>
  machine: StateDesigner<C>
  states?: IStatesConfig<C["data"], C["actions"], C["conditions"], C["results"]>
  initial?: string
}

class IStateNode<C extends StateDesignerConfig> {
  name: string
  path: string
  active = false
  previous?: IStateNode<C>
  machine: StateDesigner<C>
  parent?: IStateNode<C>
  type: StateType
  initial?: string
  children: IStateNode<C>[] = []
  events: IEvents<C> = {}
  autoEvents: {
    onEvent?: IEvent<C>[]
  }

  constructor(options = {} as IStateNodeConfig<C>) {
    const {
      machine,
      parent,
      on = {},
      name,
      initial,
      states = {},
      onEvent,
      active
    } = options

    this.machine = machine

    this.parent = parent

    this.active = active

    this.name = name

    this.path = this.parent ? this.parent.path + "." + name : this.name

    // CHILDREN

    this.initial = initial

    this.children = Object.keys(states).reduce<IStateNode<C>[]>((acc, cur) => {
      const state = states[cur]

      acc.push(
        new IStateNode({
          name: cur,
          machine: this.machine,
          parent: this,
          active: this.initial === undefined ? true : cur === this.initial,
          initial: state.initial,
          states: state.states,
          onEvent: state.onEvent,
          on: state.on
        })
      )
      return acc
    }, [])

    if (this.initial !== undefined) {
      this.previous = this.children.find(v => v.name === this.initial)
    }

    // TYPE

    this.type =
      this.children.length === 0
        ? StateType.Leaf
        : this.initial === undefined
        ? StateType.Parallel
        : StateType.Branch

    // EVENTS

    const { namedFunctions } = this.machine

    // A helpers for this tricky (one-off) operation
    function getFunction<
      L extends "actions" | "conditions" | "results",
      P extends "actions" extends L
        ? IAction<C["data"]>
        : "conditions" extends L
        ? ICondition<C["data"]>
        : IResult<C["data"]>
    >(group: L, item: keyof C[L] | P): P | undefined {
      if (typeof item === "string") {
        // Item is a string (key of one of the named function groups)
        const items = namedFunctions[group]

        if (items === undefined) {
          console.error(Errors.noNamedFunction(item, group.slice(-1)))
          return
        }

        const result = items[item]

        if (result === undefined) {
          console.error(Errors.noMatchingNamedFunction(item, group.slice(-1)))
          return
        }

        return result
      } else {
        // Item is an anonymous function (of a ype depending on the group)
        return item as P
      }
    }

    const getProcessedEventHandler = (
      eventHandler: IEventConfig<
        C["data"],
        C["actions"],
        C["conditions"],
        C["results"]
      >
    ) => {
      const handlers = castArray(eventHandler)

      return handlers.map<IEventHandler<C>>(v => {
        let result: IEventHandler<C> = {
          get: [],
          if: [],
          unless: [],
          ifAny: [],
          do: [],
          to: undefined
        }

        // We need to return a "full" event handler object, but the
        // config value may either be an anonymous action function,
        // a named action function, or a partial event handler object.

        if (typeof v === "string" || typeof v === "function") {
          const item = getFunction("actions", v)
          if (item !== undefined) result.do = [item]
        } else if (typeof v === "object") {
          result.get = castArray(v.get || []).reduce<IResult<C["data"]>[]>(
            (acc, a) => {
              const item = getFunction("results", a)
              return item === undefined ? acc : [...acc, item]
            },
            []
          )

          result.if = castArray(v.if || []).reduce<ICondition<C["data"]>[]>(
            (acc, a) => {
              const item = getFunction("conditions", a)
              return item === undefined ? acc : [...acc, item]
            },
            []
          )

          result.unless = castArray(v.unless || []).reduce<
            ICondition<C["data"]>[]
          >((acc, a) => {
            const item = getFunction("conditions", a)
            return item === undefined ? acc : [...acc, item]
          }, [])

          result.ifAny = castArray(v.ifAny || []).reduce<
            ICondition<C["data"]>[]
          >((acc, a) => {
            const item = getFunction("conditions", a)
            return item === undefined ? acc : [...acc, item]
          }, [])

          result.do = castArray(v.do || []).reduce<IAction<C["data"]>[]>(
            (acc, a) => {
              const item = getFunction("actions", a)
              return item === undefined ? acc : [...acc, item]
            },
            []
          )

          result.to = v.to
        }

        return result
      })
    }

    const getProcessedEvent = (
      event: IEventConfig<
        C["data"],
        C["actions"],
        C["conditions"],
        C["results"]
      >
    ) => {
      return castArray(event).map<IEvent<C["data"]>>(getProcessedEventHandler)
    }

    this.autoEvents = {
      onEvent: onEvent ? getProcessedEvent(onEvent) : undefined
    }

    this.events = Object.keys(on).reduce<IEvents<C>>((acc, key) => {
      acc[key] = getProcessedEvent(on[key])
      return acc
    }, {})
  }

  getTargetFromTransition = (
    transition: string,
    state: IStateNode<C>
  ): IStateNode<C> | undefined => {
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
    this.active = true

    if (this.type === "branch") {
      const activeChild = previous
        ? this.children.find(
            v => v.name === (this.previous ? this.previous.name : this.initial)
          )
        : this.children.find(v => v.name === this.initial)

      if (activeChild !== undefined) {
        this.previous = activeChild
        activeChild.activateDown(restore, restore)
      }
    }

    if (this.type === "parallel") {
      for (let child of this.children) {
        child.activateDown(restore, restore)
      }
    }
  }

  activateUp = () => {
    if (this.parent) {
      this.parent.active = true

      if (this.parent.type === "branch") {
        this.parent.previous = this
        // Deactivate siblings
        for (let sib of this.parent.children) {
          if (sib === this) continue
          if (sib.active) {
            sib.deactivate()
          }
        }
      }

      // Activate inactive parallel siblings
      if (this.parent.type === "parallel") {
        for (let sib of this.parent.children) {
          if (sib === this) continue
          if (!sib.active) {
            sib.activateDown()
          }
        }
      }

      this.parent.activateUp()
    }
  }

  activate = (previous = false, restore = false) => {
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
    handler: IEventHandler<C>,
    draft: C["data"] | Draft<C["data"]>,
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

  handleEventHandler = (
    handler: IEventHandler<C>,
    draft: Draft<C["data"]>,
    payload: any,
    result: any
  ) => {
    // --- Resolvers

    for (let resolver of handler.get) {
      result = resolver(draft, payload, result)
    }

    // --- Conditions

    if (!this.canEventHandlerRun(handler, draft, payload, result)) return draft

    // --- Actions
    for (let action of handler.do) {
      action(draft, payload, result)
    }

    return draft
  }

  public getActive = (): IStateNode<C>[] => {
    if (!this.active) {
      return []
    }

    return [
      this,
      ...this.children.reduce<IStateNode<C>[]>((acc, child) => {
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
