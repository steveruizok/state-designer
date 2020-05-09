import isUndefined from "lodash-es/isUndefined"
import isFunction from "lodash-es/isFunction"
import isNumber from "lodash-es/isNumber"
import castArray from "lodash-es/castArray"
import isString from "lodash-es/isString"
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
export function getStateTreeFromConfig<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>
>(config: S.Config<D, R, C, A, Y, T>) {
  const id = "#" + (isUndefined(config.id) ? "state" : config.id)

  const labels = new Map<Record<string, S.EventFn<D, any>> | undefined, string>(
    [
      [config.results, "results"],
      [config.conditions, "conditions"],
      [config.actions, "actions"],
      [config.asyncs, "asyncs"],
    ]
  )

  /**
   * Convert an event function config into an event function.
   * @param item
   * @param collection
   */
  function getEventFn<T, K>(
    item: Extract<keyof T, string> | S.EventFn<D, K>,
    collection: Record<string, S.EventFn<D, K>> | undefined
  ): S.EventFn<D, K> {
    if (isString(item)) {
      if (isUndefined(collection)) {
        throw Error(`No ${labels.get(collection)} in config!`)
      } else {
        const itemFromCollection = collection[item]
        if (isUndefined(itemFromCollection)) {
          throw Error(`No item in ${labels.get(collection)} named ${item}!`)
        }

        return itemFromCollection
      }
    } else {
      return item
    }
  }

  function getAsync(item: S.AsyncConfig<D, Y>) {
    return getEventFn(item, config.asyncs)
  }

  function getTime(item: S.TimeConfig<D, T> | undefined) {
    if (isUndefined(item)) return undefined
    return isNumber(item) ? () => item : getEventFn(item, config.times)
  }

  function getSend(item: S.SendConfig<D> | undefined): S.Send<D> | undefined {
    if (isUndefined(item)) return undefined
    if (isString(item)) return () => ({ event: item, payload: undefined })
    if (isFunction(item)) return item
    return () => item
  }

  function castToFunction<T>(
    item: T | S.EventFn<D, T> | undefined
  ): S.EventFn<D, T> | undefined {
    if (isUndefined(item)) return undefined
    return isFunction(item) ? item : () => item
  }

  function getResults(items: S.MaybeArray<S.ResultConfig<D, R>> | undefined) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) => getEventFn(item, config.results))
  }

  function getConditions(
    items: S.MaybeArray<S.ConditionConfig<D, C>> | undefined
  ) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) => getEventFn(item, config.conditions))
  }

  function getActions(items: S.MaybeArray<S.ActionConfig<D, A>> | undefined) {
    if (isUndefined(items)) return []
    return castArray(items).map((item) => getEventFn(item, config.actions))
  }

  /**
   * Convert an event handler item config into an event handler item.
   * @param itemCfg
   */
  function getEventHandlerItem(
    itemCfg: S.EventHandlerItemConfig<D, R, C, A, T>
  ): S.EventHandlerItem<D> {
    return {
      get: getResults(itemCfg.get),
      if: getConditions(itemCfg.if),
      unless: getConditions(itemCfg.unless),
      ifAny: getConditions(itemCfg.ifAny),
      do: getActions(itemCfg.do),
      elseDo: getActions(itemCfg.elseDo),
      to: castToFunction(itemCfg.to),
      elseTo: castToFunction(itemCfg.elseTo),
      send: getSend(itemCfg.send),
      wait: getTime(itemCfg.wait),
      break: castToFunction(itemCfg.break),
    }
  }

  /**
   * Convert an event handler config into an event handler.
   * @param event
   */
  function getEventHandler(
    event: S.EventHandlerConfig<D, R, C, A, T>
  ): S.EventHandler<D> {
    return castArray(event).map((eventHandler) => {
      switch (typeof eventHandler) {
        case "string": {
          if (isUndefined(config.actions)) {
            throw new Error("Actions is undefined!")
          } else {
            const eventFn = config.actions && config.actions[eventHandler]
            return getEventHandlerItem({ do: eventFn })
          }
        }
        case "function": {
          return getEventHandlerItem({ do: eventHandler })
        }
        default: {
          return getEventHandlerItem(eventHandler)
        }
      }
    })
  }

  /**
   * Convert a config into a state tree. Works recursively, so only call on the config.
   * @param state
   * @param name
   * @param path
   * @param active
   */
  function createState(
    state: S.StateConfig<D, R, C, A, Y, T>,
    name: string,
    path: string,
    active: boolean
  ): S.State<D> {
    return {
      name,
      path: path + name,
      active,
      history: state.initial ? [state.initial] : [],
      intervals: [],
      initial: state.initial,
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
            event: getEventHandler(state.repeat.event),
            delay: getTime(state.repeat.delay) || (() => 1 / 60),
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
                createState(
                  childState,
                  childName,
                  path + name + ".",
                  isUndefined(state.initial) || state.initial === childName
                ),
              ]
            })
          : []
      ),
    }
  }

  return createState(config, "root", id + ".", true)
}
