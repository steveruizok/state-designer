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
import { getStateTreeFromConfig } from "./getStateTreeFromConfig"

enableAllPlugins()

/* -------------------------------------------------- */
/*                Create State Designer               */
/* -------------------------------------------------- */

/**
 * Create a new state from a configuration object.
 * @param config
 * @public
 */
export function createStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  config: S.Config<D, R, C, A, Y, T, V>,
  verbose?: (message: string, type: S.VerboseType) => any
): S.StateDesigner<D, R, C, A, Y, T, V> {
  /* ------------------ Mutable Data ------------------ */

  // Update (internal update state)

  type Update = {
    process: Promise<S.StateDesigner<D, R, C, A, Y, T, V>> | void
    transitions: number
    didTransition: boolean
    didAction: boolean
  }

  const update: Update = {
    process: undefined,
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
  }

  // Call each subscriber callback with the state's current update
  function notifySubscribers() {
    vlog(`Notifying subsribers.`, S.VerboseType.Notification)
    core.values = getValues(core.data)
    core.active = StateTree.getActiveStates(core.stateTree)
    subscribers.forEach((subscriber) => subscriber(core))
  }

  /* --------------------- Updates -------------------- */

  // Run event handler that updates the global `updates` object,
  // useful for (more or less) synchronous events
  async function runOnThreadEventHandler(
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ) {
    const localUpdate = await runEventHandler(eventHandler, payload, result)
    if (localUpdate.didAction) setUpdate({ didAction: true })
    if (localUpdate.didTransition) setUpdate({ didTransition: true })
    return update
  }

  // Run event handler that only returns a local `updates` object,
  // useful in handling delayed events, repeats, etc; so that they don't
  // interfere with "on thread" event handling.
  async function runOffThreadEventHandler(
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ) {
    const localUpdate = await runEventHandler(eventHandler, payload, result)
    return localUpdate
  }

  // Try to run an event on a state. If active, it will run the corresponding
  // event, if it has one; and, so long as there hasn't been a transition,
  // will run its onEvent event, if it has one. If still no transition has
  // occurred, it will move to try its child states.
  async function handleEventOnState(
    state: S.State<D>,
    sent: S.Event
  ): Promise<void> {
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
        await runOnThreadEventHandler(eventHandler, sent.payload, undefined)
        if (update.didTransition) return
      }

      // Run onEvent, if present
      if (!isUndefined(state.onEvent)) {
        vlog(`Running onEvent in ${state.name}.`, S.VerboseType.EventHandler)
        await runOnThreadEventHandler(state.onEvent, sent.payload, undefined)
        if (update.didTransition) return
      }
      // Run event on states
      for (let childState of activeChildren) {
        if (update.didTransition) return
        await handleEventOnState(childState, sent)
      }
    }

    return
  }

  async function runEventHandler(
    eventHandler: S.EventHandler<D>,
    payload: any = undefined,
    result: any = undefined
  ): Promise<{
    didTransition: boolean
    didAction: boolean
  }> {
    let localUpdate = {
      didAction: false,
      didTransition: false,
      didElse: false,
      send: undefined as S.Event | undefined,
      transition: undefined as S.EventFn<D, string> | undefined,
      else: undefined as S.EventHandler<D> | undefined,
    }

    // TODO: Make sure off-thread event handlers don't mutate current.

    for (let item of eventHandler) {
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

      if (item.wait) {
        const s = item.wait(core.data as D, payload, result)
        await new Promise((resolve) => setTimeout(() => resolve(), s * 1000))
      }

      if (passedConditions) {
        vlog("Passed conditions.", S.VerboseType.Condition)

        // Actions
        if (item.do.length > 0) {
          vlog("Running actions.", S.VerboseType.Action)
          localUpdate.didAction = true

          core.data = await produce(core.data, async (draft) => {
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
          localUpdate.send = item.send(core.data as D, payload, result)
        }

        // Transitions
        if (!isUndefined(item.to)) {
          if (update.transitions > 200) {
            if (__DEV__) {
              throw Error("Stuck in a loop! Bailing.")
            } else {
              break
            }
          }

          setUpdate({ transitions: update.transitions++ })
          localUpdate.didTransition = true
          localUpdate.transition = item.to
        }
      } else {
        vlog("Conditions failed.", S.VerboseType.Condition)

        if (!isUndefined(item.else)) {
          localUpdate.else = item.else
        }
      }

      if (!isUndefined(localUpdate.else)) {
        const elseUpdate = await runOnThreadEventHandler(
          localUpdate.else,
          payload,
          result
        )

        if (elseUpdate.didAction) localUpdate.didAction = true
        if (elseUpdate.didTransition) localUpdate.didTransition = true
      }

      if (localUpdate.didTransition) break
    }

    // If we have a send, add that to the send queue
    if (!isUndefined(localUpdate.send)) {
      vlog("Sending event from event handler.", S.VerboseType.EventHandler)
      send(localUpdate.send.event, localUpdate.send.payload)
    }

    // If we made a transition, run that transition
    if (!isUndefined(localUpdate.transition)) {
      await runTransition(localUpdate.transition, payload, result)
    }

    return localUpdate
  }

  async function runTransition(
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

      const { interval, animationFrame } = state.times
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
    })

    for (let state of deactivatedStates) {
      const { onExit } = state

      if (!isUndefined(onExit)) {
        vlog(
          `Running onExit event on ${state.path}.`,
          S.VerboseType.TransitionEvent
        )
        await runOnThreadEventHandler(onExit, payload, result)
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
        const { delay, event } = repeat

        let now = Date.now()
        let lastTime = 0
        let elapsed = 0

        if (delay === undefined) {
          // Run on every animation frame
          vlog(
            `Starting repeat using animation frame.`,
            S.VerboseType.RepeatEvent
          )

          const loop = async (now: number) => {
            vlog(`Running repeat event.`, S.VerboseType.RepeatEvent)
            const interval = now - lastTime
            elapsed += interval

            lastTime = now

            const localUpdate = await runOffThreadEventHandler(event, payload, {
              interval,
              elapsed,
            })

            if (localUpdate.didAction || localUpdate.didTransition) {
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

          state.times.interval = setInterval(async () => {
            vlog(`Running repeat event.`, S.VerboseType.RepeatEvent)
            now = Date.now()
            const interval = now - lastTime
            elapsed += interval
            lastTime = now

            const localUpdate = await runOffThreadEventHandler(event, payload, {
              interval,
              elapsed,
            })

            if (localUpdate.didAction || localUpdate.didTransition) {
              notifySubscribers()
            }
          }, Math.max(1 / 60, s * 1000))
        }
      }

      if (!isUndefined(onEnter)) {
        vlog(`Running onEnter event.`, S.VerboseType.TransitionEvent)
        await runOnThreadEventHandler(onEnter, payload, result)
        if (update.transitions > currentTransitions) return
      }

      if (!isUndefined(async)) {
        vlog(`Running async event.`, S.VerboseType.AsyncEvent)
        async.await(core.data, payload, result).then(
          async (resolved) => {
            vlog(`Async resolved.`, S.VerboseType.AsyncEvent)
            const localUpdate = await runOffThreadEventHandler(
              async.onResolve,
              payload,
              resolved
            )

            if (localUpdate.didAction || localUpdate.didTransition)
              notifySubscribers()
          },
          async (rejected) => {
            vlog(`Async rejected.`, S.VerboseType.AsyncEvent)
            if (!isUndefined(async.onReject)) {
              const localUpdate = await runOffThreadEventHandler(
                async.onReject,
                payload,
                rejected
              )

              if (localUpdate.didAction || localUpdate.didTransition)
                notifySubscribers()
            }
          }
        )
      }
    }

    return
  }

  /* -------------- Sent Event Processing ------------- */

  const sendQueue: S.Event[] = []

  async function processSendQueue(): Promise<
    S.StateDesigner<D, R, C, A, Y, T, V>
  > {
    vlog(`Processing next in queue.`, S.VerboseType.Queue)

    setUpdate({
      didAction: false,
      didTransition: false,
    })

    const next = sendQueue.shift()

    if (isUndefined(next)) {
      vlog(`Queue is empty, resolving.`, S.VerboseType.Queue)

      setUpdate({
        process: undefined,
        transitions: 0,
      })

      return core
    } else {
      vlog(`Running next item in send queue.`, S.VerboseType.Queue)

      // Handle the event and set the current handleEventOnState
      // promise, which will hold any additional sent events
      setUpdate({
        process: await handleEventOnState(core.stateTree, next),
      })

      // Notify subscribers, if we should
      if (update.didAction || update.didTransition) {
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
   * const state = createStateDesigner({ ... })
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
  async function send(
    eventName: string,
    payload?: any
  ): Promise<S.StateDesigner<D, R, C, A, Y, T, V>> {
    vlog(`Received event ${eventName}.`, S.VerboseType.Event)
    sendQueue.push({ event: eventName, payload })
    return update.process ? update.process : processSendQueue()
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
    reducer: (
      previousValue: any,
      currentValue: [string, any],
      currentIndex: number,
      array: [string, any][]
    ) => any = (prev, cur) => [...prev, cur[1]],
    initial = []
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

    let returnValue = initial

    entries.forEach(
      (entry, i) => (returnValue = reducer(returnValue, entry, i, entries))
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
  function getConfig() {
    return config
  }

  function clone() {
    return createStateDesigner(config)
  }

  /* --------------------- Kickoff -------------------- */

  const id = "#" + (isUndefined(config.id) ? `state_${uniqueId()}` : config.id)

  const _stateTree = getStateTreeFromConfig(config, id)

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
    getConfig,
    clone,
    values: getValues(config.data as D),
  }

  // Deactivate the tree, then activate it again to trigger events
  StateTree.deactivateState(core.stateTree)
  runTransition(() => "root")

  return core
}
