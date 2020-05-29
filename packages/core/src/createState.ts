import {
  last,
  castArray,
  trimEnd,
  isFunction,
  uniqueId,
  isUndefined,
} from "lodash"
import { produce, enableAllPlugins } from "immer"

import * as S from "./types"
import * as StateTree from "./stateTree"
import { getStateTreeFromDesign } from "./getStateTreeFromDesign"

enableAllPlugins()

/* -------------------------------------------------- */
/*                Create State Designer               */
/* -------------------------------------------------- */

/**
 * Create a new state from a configuration object.
 * @param config
 * @public
 */
export function createState<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  config: S.Design<D, R, C, A, Y, T, V>,
  verbose?: (message: string, type: S.VerboseType) => any
): S.DesignedState<D, R, C, A, Y, T, V> {
  /* ------------------ Mutable Data ------------------ */

  // Update (internal update state)

  type Update = {
    transitions: number
    didTransition: boolean
    didAction: boolean
  }

  const update: Update = {
    transitions: 0,
    didTransition: false,
    didAction: false,
  }

  function setUpdate(changes: Partial<Update>) {
    Object.assign(update, changes)
    return update
  }

  /* -------------------- Debugging ------------------- */

  function vlog(message: string, type: S.VerboseType) {
    if (verbose) {
      verbose(`${new Date().toLocaleTimeString()} — ${message}`, type)
    }
  }

  /* ------------------ Subscriptions ----------------- */

  // A set of subscription callbacks. The subscribe function
  // adds a callback to the set; unsubscribe removes it.
  const subscribers = new Set<S.SubscriberFn<D>>([])

  /**
   * Subscribe a callback to this state's updates. On each update, the state
   * will call the callback with the state's new update.
   * @param callbackFn
   */
  function subscribe(callbackFn: S.SubscriberFn<D>) {
    subscribers.add(callbackFn)
  }

  /**
   * Unsubscribe a callback from the state. The callback will no longer be
   * called when the state changes.
   * @param callbackFn
   */
  function unsubscribe(callbackFn: S.SubscriberFn<D>) {
    if (subscribers.has(callbackFn)) {
      subscribers.delete(callbackFn)
    }

    // TODO: Prevent persistant intervals (in a smarter way)
    /* In some cases, intervals may persist past reloads, or when a 
    state is no longer needed. This solution is too blunt though: I can 
    imagine users wanting to keep a state's time ticking even when
    components that depend on it are unmounted. Public method for
    pause and resume? Activities with cleanup? */
    if (subscribers.size === 0) {
      recursivelyEndStateIntervals(core.stateTree)
    }
  }

  // Call each subscriber callback with the state's current update
  function notifySubscribers() {
    vlog(`Notifying subsribers.`, S.VerboseType.Notification)
    core.values = getValues(core.data)
    core.active = StateTree.getActiveStates(core.stateTree)
    subscribers.forEach((subscriber) => subscriber(core))
  }

  /* --------------------- Updates -------------------- */

  // Run eve nt handler that updates the global `updates` object,
  // useful for (more or less) synchronous events
  function runOnChainEventHandler(
    state: S.State<D>,
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ) {
    return runEventHandler(state, eventHandler, payload, result)
  }

  // Run event handler that only returns a local `updates` object,
  // useful in handling delayed events, repeats, etc; so that they don't
  // interfere with "on thread" event handling.
  function runOffChainEventHandler(
    state: S.State<D>,
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ) {
    return runEventHandler(state, eventHandler, payload, result)
  }

  // Try to run an event on a state. If active, it will run the corresponding
  // event, if it has one; and, so long as there hasn't been a transition,
  // will run its onEvent event, if it has one. If still no transition has
  // occurred, it will move to try its child states.
  function handleEventOnState(
    state: S.State<D>,
    sent: S.Event
  ): { shouldHalt: boolean; shouldNotify: boolean } {
    const record = { shouldHalt: false, shouldNotify: false }

    vlog(
      `Testing event ${sent.event} in ${state.name}.`,
      S.VerboseType.EventHandler
    )

    if (state.active) {
      vlog(`Found event state's events.`, S.VerboseType.EventHandler)

      const activeChildren = Object.values(state.states).filter(
        (state) => state.active
      )

      const eventHandler = state.on[sent.event]

      // Run event handler, if present
      if (!isUndefined(eventHandler)) {
        vlog(`Running event handlers.`, S.VerboseType.EventHandler)
        const outcome = runOnChainEventHandler(
          state,
          eventHandler,
          sent.payload,
          undefined
        )

        if (outcome.shouldHalt) {
          return outcome
        }

        if (outcome.shouldNotify) {
          record.shouldNotify = true
        }
      }

      // Run onEvent, if present
      if (!isUndefined(state.onEvent)) {
        vlog(`Running onEvent in ${state.name}.`, S.VerboseType.EventHandler)
        const outcome = runOnChainEventHandler(
          state,
          state.onEvent,
          sent.payload,
          undefined
        )
        if (outcome.shouldHalt) return outcome

        if (outcome.shouldNotify) {
          record.shouldNotify = true
        }
      }
      // Run event on states
      for (let childState of activeChildren) {
        const outcome = handleEventOnState(childState, sent)
        if (outcome.shouldHalt) return outcome

        if (outcome.shouldNotify) {
          record.shouldNotify = true
        }
      }
    }

    return record
  }

  function endStateIntervals(state: S.State<D>) {
    const { timeouts, interval, animationFrame } = state.times

    for (let timeout of timeouts) {
      clearTimeout(timeout)
    }
    state.times.timeouts = []

    if (!isUndefined(interval)) {
      vlog(`Clearing interval on ${state.path}.`, S.VerboseType.RepeatEvent)
      clearInterval(interval)
      state.times.interval = undefined
    }

    if (!isUndefined(animationFrame)) {
      vlog(
        `Clearing animation frame on ${state.path}.`,
        S.VerboseType.RepeatEvent
      )
      cancelAnimationFrame(animationFrame)
      state.times.animationFrame = undefined
    }
  }

  function recursivelyEndStateIntervals(state: S.State<D>) {
    endStateIntervals(state)
    for (let child of Object.values(state.states)) {
      recursivelyEndStateIntervals(child)
    }
  }

  function runEventHandler(
    state: S.State<D>,
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ): {
    shouldHalt: boolean
    shouldNotify: boolean
  } {
    const eventHandlerRecord = {
      shouldHalt: false,
      shouldNotify: false,
    }

    // Makes changes, returns record
    function handleHandlerObject(item: S.EventHandlerObject<D>) {
      const record = {
        shouldNotify: false,
        shouldHalt: false,
        else: undefined as S.EventHandler<D> | undefined,
        transition: undefined as S.EventFn<D, string> | undefined,
      }

      // Results
      for (let resu of item.get) {
        result = resu(core.data as D, payload, result)
      }

      // Conditions
      let passedConditions = true

      if (passedConditions && item.if.length > 0) {
        passedConditions = item.if.every((cond) =>
          cond(core.data as D, payload, result)
        )
      }

      if (passedConditions && item.unless.length > 0) {
        passedConditions = item.unless.every(
          (cond) => !cond(core.data as D, payload, result)
        )
      }

      if (passedConditions && item.ifAny.length > 0) {
        passedConditions = item.ifAny.some((cond) =>
          cond(core.data as D, payload, result)
        )
      }

      if (passedConditions) {
        vlog("Passed conditions.", S.VerboseType.Condition)

        // Actions
        if (item.do.length > 0) {
          vlog("Running actions.", S.VerboseType.Action)
          record.shouldNotify = true

          core.data = produce(core.data, (draft) => {
            for (let action of item.do) {
              action(draft as D, payload, result)
            }
          })
        }

        // Secret Actions (does not trigger an update)
        if (item.secretlyDo.length > 0) {
          vlog("Running actions.", S.VerboseType.SecretAction)

          for (let action of item.secretlyDo) {
            action(core.data as D, payload, result)
          }
        }

        // Send
        if (!isUndefined(item.send)) {
          vlog("Sending event from event handler.", S.VerboseType.EventHandler)
          const event = item.send(core.data as D, payload, result)
          send(event.event, event.payload)
        }

        // Transitions
        if (!isUndefined(item.to)) {
          if (update.transitions > 200) {
            if (__DEV__) {
              throw Error("Stuck in a loop! Bailing.")
            } else {
              record.shouldHalt = true
              return record
            }
          }

          setUpdate({ transitions: update.transitions++ })

          record.transition = item.to
          record.shouldHalt = true
          record.shouldNotify = true
        }
      } else {
        vlog("Conditions failed.", S.VerboseType.Condition)

        if (!isUndefined(item.else)) {
          record.else = item.else
        }
      }

      if (!isUndefined(record.else)) {
        const elseRecord = runOnChainEventHandler(
          state,
          record.else,
          payload,
          result
        )

        if (elseRecord.shouldHalt) record.shouldHalt = true
        if (elseRecord.shouldNotify) record.shouldNotify = true
      }

      return record
    }

    function handlerHandlerObjectChain(chain: S.EventHandler<D>) {
      for (let i = 0; i < chain.length; i++) {
        const item = chain[i]

        if (item.wait) {
          // Waited events are handled as their own chain, so
          // waiting an event handler object should trigger a notify
          // just in case.
          eventHandlerRecord.shouldNotify = true

          const s = item.wait(core.data as D, payload, result)

          // Add a timeout to the state's timeouts
          state.times.timeouts.push(
            setTimeout(() => {
              // Handle event
              const record = handleHandlerObject(item)

              if (record.shouldHalt) {
                if (!isUndefined(record.transition)) {
                  // If transition, run the transition, notify subscribers, and end
                  runTransition(record.transition, payload, result)
                  notifySubscribers()
                }
              } else {
                // If no transition, continue with the chain

                if (record.shouldNotify) {
                  // Notify subscribers immediately, I think
                  // Todo: Notify when post-wait chain settles, I think
                  notifySubscribers()
                }

                handlerHandlerObjectChain(chain.slice(i + 1))
              }
            }, s * 1000)
          )

          // Don't continue once we hit a wait event object
          return
        } else {
          // Handle event
          const record = handleHandlerObject(item)

          // If we made a transition, run that transition
          if (!isUndefined(record.transition)) {
            runTransition(record.transition, payload, result)
            eventHandlerRecord.shouldNotify = true
          }

          // If we should notify, notify
          if (record.shouldNotify) {
            eventHandlerRecord.shouldNotify = true
          }

          // If we shoudl halt, halt
          if (record.shouldHalt) {
            eventHandlerRecord.shouldHalt = true
            return
          }
        }
      }
    }

    handlerHandlerObjectChain(eventHandler)

    return eventHandlerRecord
  }

  function runTransition(
    targetFn: S.EventFn<D, string>,
    payload: any = undefined,
    result: any = undefined
  ) {
    let path = targetFn(core.data, payload, result)
    vlog(`Transitioning to ${path}.`, S.VerboseType.Transition)

    // Is this a restore transition?

    const isPreviousTransition = path.endsWith(".previous")
    const isRestoreTransition = path.endsWith(".restore")

    if (isPreviousTransition) {
      path = trimEnd(path, ".previous")
    }

    if (isRestoreTransition) {
      path = trimEnd(path, ".restore")
    }

    // Get all states from the tree that match the target
    const targets = StateTree.findTransitionTargets(core.stateTree, path)

    // Get the deepest matching target state
    const target = last(targets)

    if (isUndefined(target)) {
      if (__DEV__) {
        throw Error("No state with that path in the tree!")
      } else {
        return
      }
    }

    // Get the path of state names to the target state
    const pathDown = target.path.split(".").slice(1)

    // Get an array of states that are currently active
    const beforeActive = StateTree.getActiveStates(core.stateTree)

    // Deactivate the whole state tree
    StateTree.deactivateState(core.stateTree)

    // Update the initial states across the entire state tree.
    StateTree.setIntitialStates(core.stateTree, payload, core.data)

    // Use the path to activate the tree again
    StateTree.activateState(
      core.stateTree,
      pathDown,
      beforeActive,
      isPreviousTransition || isRestoreTransition,
      isRestoreTransition
    )

    // Get an array of states that are now active
    const afterActive = StateTree.getActiveStates(core.stateTree)

    // Get an array of states that are no longer active
    const deactivatedStates = beforeActive.filter(
      (state) => !afterActive.includes(state)
    )

    // Get an array of states that have become active
    const newlyActivatedStates = afterActive.filter(
      (state) => !beforeActive.includes(state)
    )

    const currentTransitions = update.transitions

    // Deactivated States
    // - clear any interval
    // - handle onExit events
    // - bail if we've transitioned

    deactivatedStates.forEach((state) => {
      vlog(`Deactivating ${state.path}.`, S.VerboseType.State)
      endStateIntervals(state)
    })

    for (let state of deactivatedStates) {
      const { onExit } = state

      if (!isUndefined(onExit)) {
        vlog(
          `Running onExit event on ${state.path}.`,
          S.VerboseType.TransitionEvent
        )
        runOnChainEventHandler(state, onExit, payload, result)
        if (update.transitions > currentTransitions) return
      }
    }

    // Activated States
    // - set any repeat interval
    // - handle onEnter events
    // - bail if we've transitioned

    for (let state of newlyActivatedStates) {
      vlog(`Activating ${state.path}.`, S.VerboseType.State)
      const { async, repeat, onEnter } = state

      if (!isUndefined(repeat)) {
        const { onRepeat, delay } = repeat

        let now = Date.now()
        let lastTime = 0
        let elapsed = 0

        if (delay === undefined) {
          // Run on every animation frame
          vlog(
            `Starting repeat using animation frame.`,
            S.VerboseType.RepeatEvent
          )

          const loop = (now: number) => {
            vlog(`Running repeat event.`, S.VerboseType.RepeatEvent)
            const realInterval = now - lastTime
            elapsed += realInterval

            lastTime = now

            const localUpdate = runOffChainEventHandler(
              state,
              onRepeat,
              payload,
              {
                realInterval,
                elapsed,
              }
            )

            if (localUpdate.shouldNotify) {
              notifySubscribers()
            }

            state.times.animationFrame = requestAnimationFrame(loop)
          }

          state.times.animationFrame = requestAnimationFrame(loop)
        } else {
          // Run on provided delay amount
          let lastTime = Date.now()

          const s = delay(core.data, payload, result)

          vlog(
            `Starting repeat using delay of ${s}.`,
            S.VerboseType.RepeatEvent
          )

          state.times.interval = setInterval(() => {
            vlog(`Running repeat event.`, S.VerboseType.RepeatEvent)
            now = Date.now()
            const realInterval = now - lastTime
            elapsed += realInterval
            lastTime = now

            const localUpdate = runOffChainEventHandler(
              state,
              onRepeat,
              payload,
              {
                realInterval,
                elapsed,
              }
            )

            if (localUpdate.shouldNotify) {
              notifySubscribers()
            }
          }, Math.max(1 / 60, s * 1000))
        }
      }

      if (!isUndefined(onEnter)) {
        vlog(`Running onEnter event.`, S.VerboseType.TransitionEvent)
        const onEnterRecord = runOnChainEventHandler(
          state,
          onEnter,
          payload,
          result
        )
        if (onEnterRecord.shouldHalt) {
          return
        }
      }

      if (!isUndefined(async)) {
        vlog(`Running async event.`, S.VerboseType.AsyncEvent)
        async.await(core.data, payload, result).then(
          (resolved) => {
            vlog(`Async resolved.`, S.VerboseType.AsyncEvent)
            const localUpdate = runOffChainEventHandler(
              state,
              async.onResolve,
              payload,
              resolved
            )

            if (localUpdate.shouldNotify) notifySubscribers()
          },
          (rejected) => {
            vlog(`Async rejected.`, S.VerboseType.AsyncEvent)
            if (!isUndefined(async.onReject)) {
              const localUpdate = runOffChainEventHandler(
                state,
                async.onReject,
                payload,
                rejected
              )

              if (localUpdate.shouldNotify) notifySubscribers()
            }
          }
        )
      }
    }

    return
  }

  /* -------------- Sent Event Processing ------------- */

  const sendQueue: S.Event[] = []

  function processSendQueue(): S.DesignedState<D, R, C, A, Y, T, V> {
    vlog(`Processing next in queue.`, S.VerboseType.Queue)

    setUpdate({
      didAction: false,
      didTransition: false,
    })

    const next = sendQueue.shift()

    if (isUndefined(next)) {
      vlog(`Queue is empty, resolving.`, S.VerboseType.Queue)

      setUpdate({
        transitions: 0,
      })

      return core
    } else {
      vlog(`Running next item in send queue.`, S.VerboseType.Queue)

      // Handle the event and set the current handleEventOnState
      // promise, which will hold any additional sent events
      const { shouldNotify } = handleEventOnState(core.stateTree, next)

      // Notify subscribers, if we should
      if (shouldNotify) {
        notifySubscribers()
      }

      // Then process the next sent event
      return processSendQueue()
    }
  }

  /* ----------------- Public Methods ----------------- */

  /**
   * Subscribe a callback function to the state's updates. Each time
   * the state updates (due to a successful transition or action), the
   * state will call the callback with its new update. This function
   * returns a second callback that will unsubscribe the callback.
   * @param callbackFn
   * @public
   * @example
   * const state = createState({ ... })
   * const cancelUpdates = state.onUpdate((update) => { ... })
   * if (allDone) cancelUpdates()
   *
   */
  function onUpdate(callbackFn: S.SubscriberFn<D>) {
    subscribe(callbackFn)
    return () => unsubscribe(callbackFn)
  }

  /**
   * Get an update from the current state without subscribing.
   * @param callbackFn
   * @public
   */
  function getUpdate(callbackFn: S.SubscriberFn<D>) {
    core.active = StateTree.getActiveStates(core.stateTree)
    callbackFn(core)
  }

  /**
   * Send an event to the state machine
   * @param eventName The name of the event
   * @param payload A payload of any type
   * @public
   */
  function send(
    eventName: string,
    payload?: any
  ): S.DesignedState<D, R, C, A, Y, T, V> {
    vlog(`Received event ${eventName}.`, S.VerboseType.Event)
    sendQueue.push({ event: eventName, payload })
    return processSendQueue()
  }

  /**
   * Accepts one or more paths and returns true if the state tree has matching active states for every path.
   * @param paths The paths to check
   * @public
   * @example
   * state.isIn("playing")
   * state.isIn("playing.paused")
   * state.isIn("on", "stopped") // true if BOTH states are active
   *
   */
  function isIn(path: string): boolean
  function isIn(...paths: string[]): boolean {
    return castArray(paths)
      .map((path) => (path.startsWith(".") ? path : "." + path))
      .every(
        (path) =>
          core.active.find((state) => state.path.endsWith(path)) !== undefined
      )
  }

  /**
   * Accepts one or more paths and returns true if the state tree has matching active states for any path.
   * @param paths The paths to check
   * @public
   * @example
   * state.isIn("playing")
   * state.isIn("playing.paused")
   * state.isIn("on", "stopped") // true if EITHER state is active
   *
   */
  function isInAny(path: string): boolean
  function isInAny(...paths: string[]): boolean {
    return castArray(paths)
      .map((path) => (path.startsWith(".") ? path : "." + path))
      .some(
        (path) =>
          core.active.find((state) => state.path.endsWith(path)) !== undefined
      )
  }

  /**
   * Return true if the event exists and would pass its conditions, given the current state and payload.
   * @param eventName The name of the event
   * @param payload A payload of any type
   * @public
   */
  function can(eventName: string, payload?: any, result?: any): boolean {
    return !isUndefined(
      core.active.find((state) => {
        const eventHandler = state.on[eventName]

        if (!isUndefined(eventHandler)) {
          for (let item of eventHandler) {
            // Result

            result = undefined

            for (let resu of item.get) {
              result = resu(core.data as D, payload, result)
            }

            // Conditions

            let passedConditions = true

            if (passedConditions && item.if.length > 0) {
              passedConditions = item.if.every((cond) =>
                cond(core.data, payload, result)
              )
            }

            if (passedConditions && item.unless.length > 0) {
              passedConditions = item.unless.every(
                (cond) => !cond(core.data, payload, result)
              )
            }

            if (passedConditions && item.ifAny.length > 0) {
              passedConditions = item.ifAny.some((cond) =>
                cond(core.data, payload, result)
              )
            }

            if (passedConditions) return true
          }
        }

        return false
      })
    )
  }

  /**
   * Get certain values when certain states are active. Contains a reducer to control how values are merged when multiple states are open.
   * @param paths An object with paths as keys and a value to include if this path is active.
   * @param reducer (optional) A function that will take all values from active paths and return an output.
   * @param initial (optional) The reducer's initial value.
   * @public
   */
  function whenIn(
    paths: Record<string, any>,
    reducer: "value" | "array" | S.Reducer = "value",
    initialValue?: any
  ) {
    const entries: [string, any][] = []

    Object.entries(paths).forEach(([key, value]) => {
      let v = isFunction(value) ? value() : value
      if (key === "root") {
        entries.push([key, v])
      } else {
        if (
          core.active.find((v) => {
            let safeKey = key.startsWith(".") ? key : "." + key
            return v.path.endsWith(safeKey)
          })
        ) {
          entries.push([key, v])
        }
      }
    })

    if (entries.length === 0) {
      if (!isUndefined(paths.default)) {
        entries.push(["default", paths.default])
      }
    }

    let returnValue: any
    let rdcr: S.Reducer

    if (reducer === "array") {
      returnValue = []
      rdcr = (a, [_, v]) => [...a, v]
    } else if (reducer === "value") {
      returnValue = undefined
      rdcr = (_, [__, v]) => v
    } else {
      returnValue = initialValue
      rdcr = reducer
    }

    entries.forEach(
      (entry, i) => (returnValue = rdcr(returnValue, entry, i, entries))
    )

    return returnValue
  }

  /**
   * Hideously compute values based on the current data.
   * @param data The current data state.
   */
  function getValues(data: D): S.Values<D, V> {
    return Object.entries(config.values || {}).reduce<S.Values<D, V>>(
      (acc, [key, fn]) => {
        acc[key as keyof V] = fn(data as D)
        return acc
      },
      {} as S.Values<D, V>
    )
  }

  /**
   * Get the original config object (for debugging, mostly)
   * @public
   */
  function getDesign() {
    return config
  }

  function clone() {
    return createState(config)
  }

  /* --------------------- Kickoff -------------------- */

  const id = "#" + (isUndefined(config.id) ? `state_${uniqueId()}` : config.id)

  const _stateTree = getStateTreeFromDesign(config, id)

  const core = {
    id,
    data: produce(config.data, (d) => d) as D,
    active: StateTree.getActiveStates(_stateTree),
    stateTree: _stateTree,
    send,
    isIn,
    isInAny,
    can,
    whenIn,
    onUpdate,
    getUpdate,
    getDesign,
    clone,
    values: getValues(config.data as D),
  }

  // Deactivate the tree, then activate it again to set initial active states.
  StateTree.deactivateState(core.stateTree)
  runTransition(() => "root") // Will onEnter events matter?
  core.values = getValues(core.data)
  core.active = StateTree.getActiveStates(core.stateTree)

  return core
}
