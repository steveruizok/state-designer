import { isUndefined, isFunction, isNumber, castArray, isString } from "lodash"
import fromEntries from "object.fromentries"
import entries from "object.entries"

import * as S from "./types"

if (!Object.fromEntries) Object.fromEntries = fromEntries
if (!Object.entries) Object.entries = entries

/**
 * Turn a configuration object into a complete state tree, where shortcuts in the configuration
 * API are converted into a consistent structure.
 *
 * @param config A State Designer configuration object.
 */
export function getStateTreeFromDesign<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, number | S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(config: S.Design<D, R, C, A, Y, T, V>, id: string) {
  // Convert times from raw numbers to EventFns
  let times = Object.fromEntries(
    Object.entries(config.times || {}).map(([k, v]) => {
      return [k, castToFunction(v)]
    })
  ) as Record<Extract<keyof T, string>, S.Time<D>>

  /**
   * Convert an event function config into an event function.
   * @param item
   * @param collection
   * @param collectionName
   */
  function getEventFn<T, K>(
    item: Extract<keyof T, string> | S.EventFn<D, K>,
    collection: Record<string, S.EventFn<D, K>> | undefined,
    collectionName: string
  ): S.EventFn<D, K> {
    if (isString(item)) {
      if (isUndefined(collection)) {
        throw Error(`No ${collectionName} in config!`)
      } else {
        const itemFromCollection = collection[item]
        if (isUndefined(itemFromCollection)) {
          throw Error(`No item in ${collectionName} named ${item}!`)
        }

        return itemFromCollection
      }
    } else {
      return item
    }
  }

  function castToNamedFunction<T>(item: T): () => T {
    const fn = () => item
    Object.defineProperty(fn, "name", { value: item, writable: false })
    return fn
  }

  function castToFunction<T>(
    item: T | S.EventFn<D, T> | undefined
  ): S.EventFn<D, T> | undefined {
    if (isUndefined(item)) return undefined
    return isFunction(item) ? item : castToNamedFunction(item)
  }

  function getResults(items: S.MaybeArray<S.ResultDesign<D, R>> | undefined) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) =>
      getEventFn(item, config.results, "results")
    )
  }

  function getConditions(
    items: S.MaybeArray<S.ConditionDesign<D, C>> | undefined
  ) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) =>
      getEventFn(item, config.conditions, "conditions")
    )
  }

  function getActions(items: S.MaybeArray<S.ActionDesign<D, A>> | undefined) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) =>
      getEventFn(item, config.actions, "actions")
    )
  }

  function getAsync(item: S.AsyncDesign<D, Y>) {
    return getEventFn(item, config.asyncs, "asyncs")
  }

  function getTime(item: S.TimeDesign<D, T> | undefined) {
    if (isUndefined(item)) return undefined

    return isNumber(item)
      ? castToNamedFunction(item)
      : getEventFn(item, times, "times")
  }

  function getSend(item: S.SendDesign<D> | undefined): S.Send<D> | undefined {
    if (isUndefined(item)) return undefined
    if (isString(item))
      return castToNamedFunction({ event: item, payload: undefined })
    if (isFunction(item)) return item
    return castToNamedFunction(item)
  }

  /**
   * Convert an event handler item config into an event handler item.
   * @param itemCfg
   */
  function getEventHandlerObject(
    itemCfg: S.EventHandlerObjectDesign<D, R, C, A, T>
  ): S.EventHandlerObject<D> {
    return {
      get: getResults(itemCfg.get),
      if: getConditions(itemCfg.if),
      ifAny: getConditions(itemCfg.ifAny),
      unless: getConditions(itemCfg.unless),
      unlessAny: getConditions(itemCfg.unlessAny),
      do: getActions(itemCfg.do),
      secretlyDo: getActions(itemCfg.secretlyDo),
      to: castToFunction(itemCfg.to),
      secretlyTo: castToFunction(itemCfg.secretlyTo),
      send: getSend(itemCfg.send),
      wait: getTime(itemCfg.wait),
      break: castToFunction(itemCfg.break),
      then: itemCfg.then ? getEventHandler(itemCfg.then) : undefined,
      else: itemCfg.else ? getEventHandler(itemCfg.else) : undefined,
    }
  }

  /**
   * Convert an event handler config into an event handler.
   * @param event
   */
  function getEventHandler(
    event: S.EventHandlerDesign<D, R, C, A, T>
  ): S.EventHandler<D> {
    return castArray(event).map((eventHandler) => {
      switch (typeof eventHandler) {
        case "string": {
          if (isUndefined(config.actions)) {
            throw new Error("Actions is undefined!")
          } else {
            const eventFn = config.actions && config.actions[eventHandler]
            return getEventHandlerObject({ do: eventFn })
          }
        }
        case "function": {
          return getEventHandlerObject({ do: eventHandler })
        }
        default: {
          return getEventHandlerObject(eventHandler)
        }
      }
    })
  }

  /**
   * Convert an `initial` property (if present) into an initial state.
   * @param initial The provided design for the state's initial state. Either a string or an object design (with or without logic).
   */
  function getInitialState(
    initial?: string | S.InitialStateObjectDesign<D, C, R>
  ): S.InitialStateObject<D> | undefined {
    if (isUndefined(initial)) {
      return
    }

    const withoutLogic = initial as S.InitialStateObjectDesignWithoutLogic<D>
    const withLogic = initial as S.InitialStateObjectDesignWithLogic<D, C, R>

    if (withLogic.else === undefined) {
      const init = withoutLogic
      const target = typeof init === "string" ? init : init.to

      return {
        get: [],
        if: [],
        unless: [],
        ifAny: [],
        unlessAny: [],
        to: isFunction(target) ? target : castToNamedFunction(target),
      }
    } else {
      const init = withLogic

      return {
        get: getResults(init.get),
        if: getConditions(init.if),
        unless: getConditions(init.unless),
        ifAny: getConditions(init.ifAny),
        unlessAny: getConditions(init.unlessAny),
        to: isFunction(init.to) ? init.to : castToNamedFunction(init.to),
        then: getInitialState(init.then),
        else: getInitialState(init.else),
      }
    }
  }

  /**
   * Convert a config into a state tree. Works recursively, so only call on the config.
   * @param state
   * @param name
   * @param path
   * @param active
   */
  function createState(
    state: S.StateDesign<D, R, C, A, Y, T, V>,
    name: string,
    path: string,
    active: boolean
  ): S.State<D, V> {
    // Early error detection

    if (state.initial !== undefined && state.states === undefined) {
      throw Error(
        `In ${path + name}, you've provided an initial state but no states!`
      )
    }

    return {
      name,
      path: path + name,
      active,
      activeId: 0,
      history: [],
      times: {
        timeouts: [],
        interval: undefined,
        animationFrame: undefined,
      },
      initialFn: getInitialState(state.initial),
      initial: undefined,
      onEnter: state.onEnter ? getEventHandler(state.onEnter) : undefined,
      onExit: state.onExit ? getEventHandler(state.onExit) : undefined,
      onEvent: state.onEvent ? getEventHandler(state.onEvent) : undefined,
      async: state.async
        ? {
            await: getAsync(state.async.await),
            onResolve: getEventHandler(state.async.onResolve),
            onReject: state.async.onReject
              ? getEventHandler(state.async.onReject)
              : undefined,
          }
        : undefined,
      repeat: state.repeat
        ? {
            onRepeat: getEventHandler(state.repeat.onRepeat),
            delay: state.repeat.delay ? getTime(state.repeat.delay) : undefined,
          }
        : undefined,
      on: Object.fromEntries(
        state.on
          ? Object.entries(state.on).map(([name, event]) => [
              name,
              getEventHandler(event),
            ])
          : []
      ),
      states: Object.fromEntries(
        state.states
          ? Object.entries(state.states).map(([childName, childState]) => {
              return [
                childName,
                createState(childState, childName, path + name + ".", false),
              ]
            })
          : []
      ),
    }
  }
  return createState(config, "root", id + ".", true)
}
