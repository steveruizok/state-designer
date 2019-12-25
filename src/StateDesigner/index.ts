import { castArray, uniqueId } from "lodash-es"
import { NonUndefined } from "utility-types"
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

// Computed results

export type IResult<D> = (
  data: Readonly<D>,
  payload: any,
  result: any
) => NonUndefined<any>

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

/* -------------------------------------------------- */
/*                       Classes                      */
/* -------------------------------------------------- */

// Machine subscriber

type Subscriber<C extends StateDesignerConfig> = (
  data: C["data"],
  values: undefined extends C["values"] ? undefined : IComputedReturnValues<C>
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
  root: IStateNode<C>
  namedFunctions: NamedFunctions<C["actions"], C["conditions"], C["results"]>
  subscribers = new Set<Subscriber<C>>([])
  valueFunctions: undefined extends C["values"] ? undefined : C["values"]
  values: undefined extends C["values"] ? undefined : IComputedReturnValues<C>

  constructor(options = {} as C) {
    const { data, on = {}, values, actions, conditions, results } = options

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
    this.root = new IStateNode({ machine: this, on })
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

  private notifySubscribers = (
    data: C["data"],
    values: undefined extends C["values"] ? undefined : IComputedReturnValues<C>
  ) => this.subscribers.forEach(subscriber => subscriber(data, values))

  onDataDidChange = () => {
    const { data, valueFunctions } = this

    if (valueFunctions !== undefined) {
      this.values = this.getUpdatedValues(valueFunctions as C["values"], data)
    }

    this.notifySubscribers(data, this.values)
  }

  subscribe = (onChange: Subscriber<C>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  unsubscribe = (onChange: Subscriber<C>) => {
    this.subscribers.delete(onChange)
  }

  send = (event: string, payload?: any) => {
    let result: any = undefined
    this.data = produce(this.data, (draft: Draft<C["data"]>) => {
      this.root.handleEvent(event, draft, payload, result)
    })
    this.onDataDidChange()
  }

  can = (event: string, payload?: any): boolean => {
    let draft = { ...this.data }
    let result: any = undefined
    return this.root.canHandleEvent(event, draft, payload, result)
  }
}

/* ------------------- State Node ------------------- */

interface IStateNodeConfig<C extends StateDesignerConfig> {
  on?: IEventsConfig<C["data"], C["actions"], C["conditions"], C["results"]>
  machine: StateDesigner<C>
}

class IStateNode<C extends StateDesignerConfig> {
  active = false
  machine: StateDesigner<C>
  parent?: IStateNode<C>
  children: IStateNode<C>[] = []
  events: IEvents<C> = {}

  constructor(options = {} as IStateNodeConfig<C>) {
    const { machine, on = {} } = options

    this.machine = machine

    this.events = Object.keys(on).reduce<IEvents<C>>((acc, key) => {
      const { namedFunctions } = this.machine

      // A helpers for this tricky (one-off) operation
      function getFunction<
        T extends C["actions"] | C["conditions"] | C["results"],
        K extends
          | IAction<C["data"]>
          | ICondition<C["data"]>
          | IResult<C["data"]>
      >(
        group: "actions" | "conditions" | "results",
        item: keyof T | K
      ):
        | IAction<C["data"]>
        | ICondition<C["data"]>
        | IResult<C["data"]>
        | undefined {
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
          return item as
            | IAction<C["data"]>
            | ICondition<C["data"]>
            | IResult<C["data"]>
        }
      }

      acc[key] = castArray(on[key]).map<IEvent<C["data"]>>(eventHandler => {
        const handlers = castArray(eventHandler)

        return handlers.map<IEventHandler<C>>(v => {
          let result: IEventHandler<C> = {
            get: [],
            if: [],
            unless: [],
            ifAny: [],
            do: []
          }

          // We need to return a "full" event handler object, but the
          // config value may either be an anonymous action function,
          // a named action function, or a partial event handler object.

          if (typeof v === "string" || typeof v === "function") {
            const item = getFunction<C["actions"], IAction<C["data"]>>(
              "actions",
              v
            )
            if (item !== undefined) result.do = [item]
          } else if (typeof v === "object") {
            result.get = castArray(v.get || []).reduce<IResult<C["data"]>[]>(
              (acc, a) => {
                const item = getFunction<C["results"], IResult<C["data"]>>(
                  "results",
                  a
                )
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.if = castArray(v.if || []).reduce<ICondition<C["data"]>[]>(
              (acc, a) => {
                const item = getFunction<
                  C["conditions"],
                  ICondition<C["data"]>
                >("conditions", a)
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.unless = castArray(v.unless || []).reduce<
              ICondition<C["data"]>[]
            >((acc, a) => {
              const item = getFunction<C["conditions"], ICondition<C["data"]>>(
                "conditions",
                a
              )
              return item === undefined ? acc : [...acc, item]
            }, [])

            result.ifAny = castArray(v.ifAny || []).reduce<
              ICondition<C["data"]>[]
            >((acc, a) => {
              const item = getFunction<C["conditions"], ICondition<C["data"]>>(
                "conditions",
                a
              )
              return item === undefined ? acc : [...acc, item]
            }, [])

            result.do = castArray(v.do || []).reduce<IAction<C["data"]>[]>(
              (acc, a) => {
                const item = getFunction<C["conditions"], IAction<C["data"]>>(
                  "actions",
                  a
                )
                return item === undefined ? acc : [...acc, item]
              },
              []
            )
          }

          return result
        })
      })

      return acc
    }, {})
  }

  public handleEvent = (
    event: string,
    draft: Draft<C["data"]>,
    payload: any,
    result: any
  ) => {
    let eventHandlers = this.events[event]
    if (eventHandlers === undefined) return

    let didChange = false

    const beginHandlingEvent = (handler: IEventHandler<C>) => {
      if (this.handleEventHandler(handler, draft, payload, result))
        didChange = true

      // If this state has a parent, then send the event
      // up the state tree.  When at the top of the tree,
      // if the previous events caused any actions to run,
      // then report the change back to the mothership.
      if (this.parent !== undefined) {
        return this.parent.handleEvent(event, draft, payload, result)
      } else if (didChange) {
        return draft
      }
    }

    for (let eventHandler of eventHandlers) {
      for (let handler of eventHandler) {
        if (handler.wait !== undefined) {
          setTimeout(() => beginHandlingEvent(handler), handler.wait * 1000)
        } else {
          beginHandlingEvent(handler)
        }
      }
    }
  }

  canHandleEvent = (
    event: string,
    draft: Draft<C["data"]>,
    payload: any,
    result: any
  ): boolean => {
    let eventHandlers = this.events[event]
    if (eventHandlers !== undefined) {
      for (let eventHandler of eventHandlers) {
        for (let handler of eventHandler) {
          if (handler.wait !== undefined) {
            // All async actions should return can true
            return true
          } else {
            for (let resolver of handler.get) {
              result = resolver(draft, payload, result)
            }

            if (this.canEventHandlerRun(handler, draft, payload, result)) {
              return true
            }
          }
        }
      }
    }

    if (this.parent === undefined) {
      return false
    } else {
      return this.parent.canHandleEvent(event, draft, payload, result)
    }
  }

  private canEventHandlerRun = (
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

  private handleEventHandler = (
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

    if (!this.canEventHandlerRun(handler, draft, payload, result)) return

    // --- Actions
    for (let action of handler.do) action(draft, payload, result)

    // --- Transition - TODO

    return true
  }
}

export default StateDesigner

const Errors = {
  noNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s.`,
  noMatchingNamedFunction: (name: string, type: string) =>
    `Error! You've referenced a named ${type} (${name}) but your configuration does not include any named ${type}s with that name.`
}
