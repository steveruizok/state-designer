import { castArray, uniqueId } from "lodash-es"
import { NonUndefined } from "utility-types"
import produce, { Draft } from "immer"

type NamedOrInSeries<T, K> = keyof K | T | (keyof K | T)[]

// Named Functions

type INamedFunctions<T> = { [key: string]: T }

// Actions

export type IActionConfig<D, P = any, R = any> = (
  data: D,
  payload: P,
  result: R
) => any

export type IAction<D, P = any, R = any> = (
  data: D,
  payload: P,
  result: R
) => any

type IActions<D, A> = NamedOrInSeries<IAction<D>, A>

// Conditions

export type ICondition<D, P = any, R = any> = (
  data: Readonly<D>,
  payload: P,
  result: R
) => boolean

type IConditions<D, C> = NamedOrInSeries<ICondition<D>, C>

// Computed results

export type IResult<D, P = any, R = any> = (
  data: Readonly<D>,
  payload: P,
  result: R
) => NonUndefined<any>

type IResults<D, R> = NamedOrInSeries<IResult<D>, R>

// Computed values

export type IComputedValue<D, K = any> = (data: Readonly<D>) => K

export type IComputedValues<D> = {
  [key: string]: IComputedValue<D>
}

export type IComputedValuesConfig<D> = { [key: string]: IComputedValue<D> }

export type IComputedReturnValues<D, T extends IComputedValues<D>> = {
  [key in keyof T]: ReturnType<T[key]>
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

interface IEventHandler<D> {
  do: IAction<D>[]
  if: ICondition<D>[]
  ifAny: ICondition<D>[]
  unless: ICondition<D>[]
  get: IResult<D>[]
  wait?: number
}

type IEvent<D> = IEventHandler<Draft<D>>[]

type IEvents<D> = { [key: string]: IEvent<D>[] }

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

type Subscriber<D, V extends IComputedValuesConfig<D>> = (
  data: D,
  values: undefined extends V ? undefined : IComputedReturnValues<D, V>
) => void

// Machine configuration

export interface StateDesignerConfig<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>
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

class StateDesigner<
  D extends any,
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends Record<string, IComputedValue<D>>
> {
  id = uniqueId()
  data: any
  root: IStateNode<D, A, C, R, V>
  namedFunctions: NamedFunctions<A, C, R>
  subscribers = new Set<Subscriber<D, V>>([])
  valueFunctions: undefined extends V ? undefined : V
  values: undefined extends V ? undefined : IComputedReturnValues<D, V>

  constructor(options = {} as StateDesignerConfig<D, A, C, R, V>) {
    const { data, on = {}, values, actions, conditions, results } = options

    this.data = data

    this.valueFunctions = values as undefined extends V ? undefined : V

    if (values === undefined) {
      this.values = undefined as undefined extends V
        ? undefined
        : IComputedReturnValues<D, V>
    } else {
      this.values = Object.keys(values as V).reduce<
        IComputedReturnValues<D, V>
      >(
        (acc, key: keyof V) =>
          Object.assign(acc, { [key]: (values as V)[key](data) }),
        {} as IComputedReturnValues<D, V>
      ) as undefined extends V ? undefined : IComputedReturnValues<D, V>
    }

    this.namedFunctions = {
      actions,
      conditions,
      results
    }
    this.root = new IStateNode({ machine: this, on })
  }

  private getUpdatedValues = (
    valueFunctions: V,
    draft: D
  ): undefined extends V ? undefined : IComputedReturnValues<D, V> => {
    return Object.keys(valueFunctions as V).reduce<IComputedReturnValues<D, V>>(
      (acc, key: keyof V) =>
        Object.assign(acc, { [key]: (valueFunctions as V)[key](draft) }),
      {} as IComputedReturnValues<D, V>
    ) as undefined extends V ? undefined : IComputedReturnValues<D, V>
  }

  private notifySubscribers = (
    data: D,
    values: undefined extends V ? undefined : IComputedReturnValues<D, V>
  ) => this.subscribers.forEach(subscriber => subscriber(data, values))

  onDataDidChange = () => {
    const { data, valueFunctions } = this

    if (valueFunctions !== undefined) {
      this.values = this.getUpdatedValues(valueFunctions as V, data)
    }

    this.notifySubscribers(data, this.values)
  }

  subscribe = (onChange: Subscriber<D, V>) => {
    this.subscribers.add(onChange)
    return () => this.unsubscribe(onChange)
  }

  unsubscribe = (onChange: Subscriber<D, V>) => {
    this.subscribers.delete(onChange)
  }

  send = (event: string, payload?: any) => {
    let result: any = undefined
    this.data = produce(this.data, (draft: Draft<D>) => {
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

interface IStateNodeConfig<
  D extends any,
  A extends INamedFunctions<IAction<D>>,
  C extends INamedFunctions<ICondition<D>>,
  R extends INamedFunctions<IResult<D>>,
  V extends Record<string, IComputedValue<D>>
> {
  on?: IEventsConfig<D, A, C, R>
  machine: StateDesigner<D, A, C, R, V>
}

class IStateNode<
  D extends any,
  A extends INamedFunctions<IAction<D>>,
  C extends INamedFunctions<ICondition<D>>,
  R extends INamedFunctions<IResult<D>>,
  V extends Record<string, IComputedValue<D>>
> {
  active = false
  machine: StateDesigner<D, A, C, R, V>
  parent?: IStateNode<D, A, C, R, V>
  children: IStateNode<D, A, C, R, V>[] = []
  events: IEvents<D> = {}

  constructor(options = {} as IStateNodeConfig<D, A, C, R, V>) {
    const { machine, on = {} } = options

    this.machine = machine

    this.events = Object.keys(on).reduce<IEvents<D>>((acc, key) => {
      const { namedFunctions } = this.machine

      // A helpers for this tricky (one-off) operation
      function getFunction<
        T extends A | C | R,
        K extends IAction<D> | ICondition<D> | IResult<D>
      >(
        group: "actions" | "conditions" | "results",
        item: keyof T | K
      ): IAction<D> | ICondition<D> | IResult<D> | undefined {
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
          return item as IAction<D> | ICondition<D> | IResult<D>
        }
      }

      acc[key] = castArray(on[key]).map<IEvent<D>>(eventHandler => {
        const handlers = castArray(eventHandler)

        return handlers.map<IEventHandler<D>>(v => {
          let result: IEventHandler<D> = {
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
            const item = getFunction<A, IAction<D>>("actions", v)
            if (item !== undefined) result.do = [item]
          } else if (typeof v === "object") {
            result.get = castArray(v.get || []).reduce<IResult<D>[]>(
              (acc, a) => {
                const item = getFunction<R, IResult<D>>("results", a)
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.if = castArray(v.if || []).reduce<ICondition<D>[]>(
              (acc, a) => {
                const item = getFunction<C, ICondition<D>>("conditions", a)
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.unless = castArray(v.unless || []).reduce<ICondition<D>[]>(
              (acc, a) => {
                const item = getFunction<C, ICondition<D>>("conditions", a)
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.ifAny = castArray(v.ifAny || []).reduce<ICondition<D>[]>(
              (acc, a) => {
                const item = getFunction<C, ICondition<D>>("conditions", a)
                return item === undefined ? acc : [...acc, item]
              },
              []
            )

            result.do = castArray(v.do || []).reduce<IAction<D>[]>((acc, a) => {
              const item = getFunction<A, IAction<D>>("actions", a)
              return item === undefined ? acc : [...acc, item]
            }, [])
          }

          return result
        })
      })

      return acc
    }, {})
  }

  public handleEvent = (
    event: string,
    draft: Draft<D>,
    payload: any,
    result: any
  ) => {
    let eventHandlers = this.events[event]
    if (eventHandlers === undefined) return

    let didChange = false

    const beginHandlingEvent = (handler: IEventHandler<Draft<D>>) => {
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
    draft: D,
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
    handler: IEventHandler<Draft<D>>,
    draft: D | Draft<D>,
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
    handler: IEventHandler<Draft<D>>,
    draft: Draft<D>,
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
