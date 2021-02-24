import last from "lodash/last"
import castArray from "lodash/castArray"
import isFunction from "lodash/isFunction"
import uniqueId from "lodash/uniqueId"
import isUndefined from "lodash/isUndefined"
import { produce, enableES5, enableMapSet, setAutoFreeze } from "immer"
import { testEventHandlerConditions } from "./testEventHandlerConditions"
import { createEventChain } from "./createEventChain"
import * as S from "./types"
import * as StateTree from "./stateTree"
import { getStateTreeFromDesign } from "./getStateTreeFromDesign"

enableES5()
enableMapSet()
setAutoFreeze(false)

/* -------------------------------------------------- */
/*                Create State Designer               */
/* -------------------------------------------------- */

/**
 * Create a new state from a design object.
 * @param design The state's design object.
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
>(design: S.Design<D, R, C, A, Y, T, V>): S.DesignedState<D, V> {
  type ThisState = S.DesignedState<D, V>

  let logEnabled = false

  /* ------------------ Subscriptions ----------------- 
  
  A state can have one or more subscribers. A state's subscribers
  are callbacks to fire when the state updates, and which will receive
  the changed state.
  */

  const subscribers = new Set<S.SubscriberFn<Snapshot>>([])

  /**
   * Subscribe a callback to this state's updates. On each update, the state
   * will call the callback with the state's new update.
   * @param callbackFn The callback to subscribe.
   */
  function subscribe(callbackFn: S.SubscriberFn<Snapshot>) {
    subscribers.add(callbackFn)
  }

  /**
   * Unsubscribe a callback from the state. The callback will no longer be
   * called when the state changes.
   * @param callbackFn The callback to unsubscribe.
   */
  function unsubscribe(callbackFn: S.SubscriberFn<Snapshot>) {
    if (subscribers.has(callbackFn)) {
      subscribers.delete(callbackFn)
    }

    /* In some cases, intervals may persist past reloads, or when a 
    state is no longer needed. This solution is too blunt though: I can 
    imagine users wanting to keep a state's time ticking even when
    components that depend on it are unmounted. Public method for
    pause and resume? Activities with cleanup? */
    if (subscribers.size === 0) {
      stopLoop()
      StateTree.recursivelyEndStateIntervals(snapshot.stateTree)
    }
  }

  /**
   * Call each subscriber callback with the current state.
   */
  function notifySubscribers() {
    setValues()
    setLog()
    setActiveStates()
    subscribers.forEach((subscriber) => subscriber(snapshot))
  }

  /* --------------------- Updates -------------------- */

  /**
   * Handle the outcome of an event handler chain.
   * @param outcome The outcome of an event handler chain.
   * @param payload The payload (if any) sent with the event that led to the event handler chain.
   */
  function handleEventHandlerChainOutcome(
    outcome: S.EventChainOutcome<ThisState>,
    payload: any
  ) {
    snapshot.data = outcome.data

    for (let transition of outcome.pendingTransition) {
      runTransition(transition, payload, outcome.result)
    }
  }

  // Run event handler that updates the global `updates` object,
  // useful for (more or less) synchronous eventss
  function runEventHandlerChain(
    state: S.State<ThisState>,
    eventHandler: S.EventHandler<D>,
    payload: any,
    result: any
  ) {
    const outcome = createEventChain<ThisState>({
      state,
      data: snapshot.data,
      result,
      payload,
      handler: eventHandler,
      onDelayedOutcome: (outcome) => {
        handleEventHandlerChainOutcome(outcome, payload)

        if (outcome.shouldNotify) {
          notifySubscribers()
        }
      },
      getFreshDataAfterWait: () => snapshot.data,
    })

    handleEventHandlerChainOutcome(outcome, payload)

    return outcome
  }

  // Try to run an event on a state. If active, it will run the corresponding
  // event, if it has one; and, so long as there hasn't been a transition,
  // will run its onEvent event, if it has one. If still no transition has
  // occurred, it will move to try its child states.
  function handleEventOnState(
    state: S.State<ThisState>,
    sent: S.Event
  ): { shouldHalt: boolean; shouldNotify: boolean } {
    const record = { shouldHalt: false, shouldNotify: false }

    if (!state.active) return record

    const activeChildren = Object.values(state.states).filter(
      (state) => state.active
    )

    const eventHandler = state.on[sent.event]

    let outcome: S.EventChainOutcome<ThisState> | undefined = undefined

    // Run event handler, if present
    if (!isUndefined(eventHandler)) {
      outcome = runEventHandlerChain(
        state,
        eventHandler,
        sent.payload,
        undefined
      )

      if (outcome.shouldNotify) {
        record.shouldNotify = true
      }

      if (outcome.shouldBreak) {
        record.shouldNotify = true
        record.shouldHalt = true
        return record
      }
    }

    // Run onEvent, if present
    if (!isUndefined(state.onEvent)) {
      outcome = runEventHandlerChain(
        state,
        state.onEvent,
        sent.payload,
        outcome?.result
      )

      if (outcome.shouldNotify) {
        record.shouldNotify = true
      }

      if (outcome.shouldBreak) {
        record.shouldNotify = true
        record.shouldHalt = true
        return record
      }
    }
    // Run event on states
    for (let childState of activeChildren) {
      const childRecord = handleEventOnState(childState, sent)

      if (childRecord.shouldNotify) {
        record.shouldNotify = true
      }

      if (childRecord.shouldHalt) {
        record.shouldNotify = true
        record.shouldHalt = true
        return record
      }
    }

    return record
  }

  /**
   * Run a transition.
   *
   * @param path The path (or path segment) indicating the transition's target state.
   * @param payload The payload (if any) sent along with the event that caused the transition.
   * @param result The current result (if any) passed along from the event handler chain.
   */
  function runTransition(path: string, payload: any, result: any) {
    const isPreviousTransition = path.endsWith(".previous")
    const isRestoreTransition = path.endsWith(".restore")

    if (isPreviousTransition) {
      path = path.slice(0, path.length - 9)
    } else if (isRestoreTransition) {
      path = path.slice(0, path.length - 8)
    }

    // Get all states from the tree that match the target
    const targets = StateTree.findTransitionTargets(snapshot.stateTree, path)

    // Get the deepest matching target state
    const target = last(targets)

    if (isUndefined(target)) {
      if (__DEV__) {
        throw Error(`Error in transitions! Could not find that state (${path})`)
      } else {
        return
      }
    }

    // Get the path of state names to the target state
    const pathDown = target.path.split(".").slice(1)

    // Get an array of states that are currently active (before the transition)
    const beforeActive = StateTree.getActiveStates(snapshot.stateTree)

    // Ok, time to change which states are active!

    // 1. Deactivate the whole state tree
    StateTree.deactivateState(snapshot.stateTree)

    // 2. Update the initial states across the entire state tree.
    StateTree.setIntitialStates(snapshot.stateTree, payload, snapshot.data)

    // 3. Use the path to activate the tree again
    StateTree.activateState(
      snapshot.stateTree,
      pathDown,
      beforeActive,
      isPreviousTransition || isRestoreTransition,
      isRestoreTransition
    )

    // Get an array of states that are now active (after the transition)
    const afterActive = StateTree.getActiveStates(snapshot.stateTree)

    // Get an array of states that are no longer active
    const deactivatedStates = beforeActive.filter(
      (state) => !afterActive.includes(state)
    )

    // Get an array of states that have become active
    const newlyActivatedStates = afterActive.filter(
      (state) => !beforeActive.includes(state)
    )

    // Deactivated States
    // - clear any interval
    // - handle onExit events
    // - bail if we've transitioned

    deactivatedStates.forEach((state) => {
      StateTree.endStateIntervals(state)
      removeOnFrameEventHandler(state)
    })

    for (let state of deactivatedStates) {
      const { onExit } = state
      state.activeId++

      if (!isUndefined(onExit)) {
        const onExitOutcome = runEventHandlerChain(
          state,
          onExit,
          payload,
          result
        )
        if (onExitOutcome.shouldBreak) return
      }
    }

    // Activated States
    // - set any repeat interval
    // - handle onEnter events
    // - bail if we've transitioned

    for (let state of newlyActivatedStates) {
      const { async, repeat, onEnter } = state

      if (!isUndefined(repeat)) {
        const { onRepeat, delay } = repeat

        let now = performance.now()
        // let lastTime: number | undefined = undefined
        let elapsed = 0
        let realInterval = 0

        if (delay === undefined) {
          // Add state to batched frame events and (maybe) start the loop
          addOnFrameState(state, { payload, start: now })
        } else {
          // Run on provided delay amount
          let lastTime = performance.now()

          const s = delay(snapshot.data, payload, result)

          state.times.interval = setInterval(() => {
            now = performance.now()
            realInterval = now - lastTime
            elapsed += realInterval
            lastTime = now

            const outcome = runEventHandlerChain(state, onRepeat, payload, {
              interval: realInterval,
              elapsed,
            })

            if (outcome.shouldNotify) notifySubscribers()
          }, Math.max(1 / 60, s * 1000))
        }
      }

      if (!isUndefined(onEnter)) {
        const onEnterOutcome = runEventHandlerChain(
          state,
          onEnter,
          payload,
          result
        )

        if (onEnterOutcome.shouldBreak) return
      }

      if (!isUndefined(async)) {
        let finished = false

        state.times.cancelAsync = () => (finished = true)

        async.await(snapshot.data, payload, result).then(
          (resolved) => {
            if (finished) return

            const localUpdate = runEventHandlerChain(
              state,
              async.onResolve,
              payload,
              resolved
            )

            if (localUpdate.shouldNotify) notifySubscribers()
          },
          (rejected) => {
            if (!isUndefined(async.onReject)) {
              if (finished) return

              const localUpdate = runEventHandlerChain(
                state,
                async.onReject,
                payload,
                rejected
              )

              if (localUpdate.shouldNotify) notifySubscribers()
            }
          }
        )
      } // End async handling
    } // End for newlyActivatedStates
  }

  function enableLog(enabled: boolean) {
    logEnabled = enabled
  }

  function logEvent(event: string) {
    if (logEnabled) {
      _log.unshift(event)
    } else {
      _log = [event]
    }
  }

  function setLog() {
    snapshot.index++
    snapshot.log = [..._log]
  }

  function setValues() {
    snapshot.values = getValues(snapshot.data, design.values)
  }

  function setActiveStates() {
    _activeStates = StateTree.getActiveStates(snapshot.stateTree)
    snapshot.active = getPaths(_activeStates)
  }

  /* ---------------- Event Processing ----------------  

   Events sent to the state need to be _processed_ by handling the
   event in the state tree's active states and then _resolved_ with
   the resulting state. If an event causes the state to receive more
   events, then all of those events should resolve the same state and
   produce as most one notification.

   */

  interface EventWithSettle extends S.Event {
    onSettle?: (snapshot: Snapshot) => void
  }

  let queueState: "ready" | "processing" = "ready"
  let processShouldNotify = false

  const eventsToProcess: EventWithSettle[] = []
  const eventsToResolve: EventWithSettle[] = []

  /**
   * Process the queue of received events. If no events are left, finish the
   * queue by (possibly) notifing subscribers, resolving processed events,
   * and then preparing to receive new events.
   */
  function processEventQueue(): Snapshot {
    queueState = "processing"

    while (eventsToProcess.length > 0) {
      const processingEvent = eventsToProcess.shift()

      if (processingEvent === undefined) break

      // If we have an event to process, process it by handling it
      // on all active states, starting from the root state. Then add
      // it to the eventsToResolve array so we can resolve it later.

      const { shouldNotify } = handleEventOnState(
        snapshot.stateTree,
        processingEvent
      )

      logEvent(processingEvent.event)

      if (shouldNotify) processShouldNotify = true

      eventsToResolve.push(processingEvent)
    }

    // Notify subscribers, if needed
    if (processShouldNotify) {
      notifySubscribers()
      processShouldNotify = false
    }

    // Settle all events in queue with final snapshot
    while (eventsToResolve.length > 0) {
      eventsToResolve.shift()?.onSettle?.(snapshot)
    }

    // We may have received more events after notifying or
    // settling events. If so, they'll be waiting, so we
    // should process them now.
    if (eventsToProcess.length > 0) {
      return processEventQueue()
    }

    // Otherwise, finish up by getting ready to receive new events.
    queueState = "ready"
    return snapshot
  }

  /* ------------------ Per Frame Loop ---------------- 

  When states have an `onRepeat` event without a delay,
  that event will be handled on every animation frame (usually
  sixty times per second). These events are "batched" —
  iterated through on each frame, producing at most a single
  synchronous update. We wouldn't want to have multiple
  onRepeat events producing multiple separate updates per frame.

  */

  let lastTime = -1
  let interval = -1
  let frameInterval: number | undefined = undefined
  type OnFrameInfo = { payload: any; start: number }
  const onFrameStates = new Map<S.State<ThisState>, OnFrameInfo>([])

  /**
   * The main loop to run on each animation frame. Handles the `onRepeat` event on all
   * states that have a per-frame repeat event.
   * @param ms Current duration of the loop in milliseconds, as returned by requestAnimationFrame.
   */
  function loop(ms: number) {
    let shouldNotify = false

    if (lastTime < 0) lastTime = ms
    interval = ms - lastTime
    lastTime = ms

    const states = Array.from(onFrameStates.entries())

    for (let [state, info] of states) {
      if (state.repeat?.onRepeat !== undefined) {
        const outcome = runEventHandlerChain(
          state,
          state.repeat.onRepeat,
          info.payload,
          {
            interval,
            elapsed: ms - info.start,
          }
        )

        if (outcome.shouldNotify) {
          shouldNotify = true
        }

        if (outcome.shouldBreak) {
          break
        }
      }
    }

    if (shouldNotify) notifySubscribers()

    if (frameInterval === undefined) return

    frameInterval = requestAnimationFrame(loop)
  }

  /**
   * Stop the loop.
   */
  function stopLoop() {
    if (frameInterval !== undefined) {
      cancelAnimationFrame(frameInterval)
      frameInterval = undefined
      lastTime = -1
      interval = -1
    }
  }

  /**
   * Start the loop.
   */
  function startLoop() {
    frameInterval = requestAnimationFrame(loop)
  }

  /**
   * Add a state to onFrameStates and start the loop, if it isn't already running
   * @param state The state to add.
   * @param info The payload and start time for this state's loop.
   */
  function addOnFrameState(state: S.State<ThisState>, info: OnFrameInfo) {
    onFrameStates.set(state, info)
    if (frameInterval === undefined) {
      startLoop()
    }
  }

  //
  /**
   * Remove a state from onFrameStates. Will stop the loop if there are no more repeating states
   * @param state The state to remove.
   */
  function removeOnFrameEventHandler(state: S.State<ThisState>) {
    if (onFrameStates.has(state)) {
      onFrameStates.delete(state)
      if (onFrameStates.size === 0) {
        stopLoop()
      }
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
  function onUpdate(callbackFn: S.SubscriberFn<Snapshot>) {
    subscribe(callbackFn)
    return () => unsubscribe(callbackFn)
  }

  /**
   * Get an update from the current state without subscribing.
   * @param callbackFn
   * @public
   */
  function getUpdate(callbackFn: S.SubscriberFn<Snapshot>) {
    setValues()
    setActiveStates()
    setLog()
    callbackFn(snapshot)
  }

  /**
   * Send an event to be processed. The state may be processing another event, but the events
   * will settle synchronously. In particularly racey conditions, or where the event causes a
   * new event to be send to the state, you may pass in a callback that will run when all
   * queued events have settled.
   * @param eventName The name of the event
   * @param payload An (optional) payload of any type
   * @param onSettle An (optional) callback to run when the event has settled.
   * @public
   */
  function send(
    eventName: string,
    payload?: any,
    onSettle?: (snapshot: Snapshot) => void
  ): Snapshot {
    eventsToProcess.push({ event: eventName, payload, onSettle })

    if (queueState === "ready") {
      try {
        processEventQueue()
      } catch (e) {
        throw Error(`${eventName}: ${e.message}`)
      }
    }

    return snapshot
  }

  // Memoized calls to `send` when payloads aren't needed.

  const sendCache = new Map<
    string,
    (eventName: string, payload?: any) => Snapshot
  >([])

  function thenSend(
    eventName: string
  ): (eventName: string, payload?: any) => Snapshot {
    let cached = sendCache.get(eventName)

    if (!cached) {
      cached = () => send(eventName)
      sendCache.set(eventName, cached)
    }

    return cached
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
  function isIn(...paths: string[]): boolean {
    return castArray(paths)
      .map((path) => (path.startsWith(".") ? path : "." + path))
      .every(
        (path) =>
          _activeStates.find((state) => state.path.endsWith(path)) !== undefined
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
  function isInAny(...paths: string[]): boolean {
    return castArray(paths)
      .map((path) => (path.startsWith(".") ? path : "." + path))
      .some(
        (path) =>
          _activeStates.find((state) => state.path.endsWith(path)) !== undefined
      )
  }

  /**
   * Return true if the event could be handled and at least one of its handlers would pass its conditions, given the current state and payload.
   * @param eventName The name of the event
   * @param payload A payload of any type
   * @public
   */
  function can(eventName: string, payload?: any, result?: any): boolean {
    return !isUndefined(
      _activeStates.find((state) => {
        const eventHandler = state.on[eventName]
        if (isUndefined(eventHandler)) return

        try {
          return eventHandler.some((handler) => {
            result = undefined

            for (let resu of handler.get) {
              result = resu(snapshot.data as D, payload, result)
            }

            return testEventHandlerConditions(
              handler,
              snapshot.data,
              payload,
              result
            )
          })
        } catch (e) {
          throw Error(`Error in state.can(${eventName}): ${e.message}`)
        }
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
  function whenIn<T = unknown>(
    paths: Record<string, any>,
    reducer: "value" | "array" | S.Reducer<T> = "value",
    initialValue?: any
  ): T {
    const entries: [string, any][] = []

    Object.entries(paths).forEach(([key, value]) => {
      let v = isFunction(value) ? value() : value
      if (key === "root") {
        entries.push([key, v])
      } else {
        if (
          _activeStates.find((v) => {
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
    let rdcr: S.Reducer<T>

    if (reducer === "array") {
      returnValue = []
      rdcr = (a, [_, v]) => [...a, v] as any
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
   * Get the original design object (for debugging, mostly)
   * @public
   */
  function getDesign() {
    return design
  }

  /**
   * Create a new state from this state's original design
   * @public
   */
  function clone() {
    return createState(design)
  }

  function forceTransition(target: string, payload?: string) {
    logEvent(`Forced transition to: ${target}`)
    runTransition(target, payload, undefined)
    notifySubscribers()
    return snapshot
  }

  /**
   * Reset state based on original design.
   */
  function reset(): Snapshot {
    stopLoop()
    StateTree.recursivelyEndStateIntervals(snapshot.stateTree)
    _log = []

    Object.assign(snapshot, {
      data: produce(design.data, (d) => d) as D,
      stateTree: getStateTreeFromDesign(design, id),
      log: [],
    })

    StateTree.deactivateState(snapshot.stateTree)
    runTransition("root", undefined, undefined) // Will onEnter events matter?
    notifySubscribers()

    return snapshot
  }

  /* --------------------- Kickoff -------------------- */

  const id = "#" + (isUndefined(design.id) ? `state_${uniqueId()}` : design.id)
  const initialStateTree = getStateTreeFromDesign(design, id)

  let _log: string[] = []
  let _activeStates = StateTree.getActiveStates(initialStateTree)

  const snapshot = {
    id,
    data: produce(design.data, (d) => d) as D,
    active: getPaths(_activeStates),
    stateTree: initialStateTree,
    log: _log,
    index: 0,
    send,
    thenSend,
    isIn,
    isInAny,
    can,
    whenIn,
    getDesign,
    onUpdate,
    getUpdate,
    clone,
    reset,
    forceTransition,
    enableLog,
    values: getValues(design.data as D, design.values),
  }

  type Snapshot = typeof snapshot

  // Deactivate the tree, then activate it again to set initial active states.
  StateTree.deactivateState(snapshot.stateTree)
  runTransition("root", undefined, undefined) // Will onEnter events matter?
  setValues()
  setActiveStates()
  setLog()

  return snapshot
}

/* -------------------------------------------------- */
/*                        Pure                        */
/* -------------------------------------------------- */

/**
 * Get paths from an array of states.
 * @param states A set of states
 */
function getPaths<G extends S.DesignedState>(states: S.State<G>[]) {
  return states.map((state) => state.path)
}

/**
 * Compute values based on the current data. A horrible affront to typescript.
 * @param data The current data state.
 */
function getValues<D, V extends Record<string, S.Value<D>>>(
  data: D,
  values: V | undefined
): S.Values<D, V> {
  return Object.entries(values || {}).reduce<S.Values<D, V>>(
    (acc, [key, fn]) => {
      acc[key as keyof V] = fn(data as D)
      return acc
    },
    {} as S.Values<D, V>
  )
}
