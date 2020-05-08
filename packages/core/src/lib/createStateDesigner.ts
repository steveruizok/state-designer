import last from "lodash-es/last"
import castArray from "lodash-es/castArray"
import trimEnd from "lodash-es/trimEnd"
import isFunction from "lodash-es/isFunction"
import isUndefined from "lodash-es/isUndefined"
import { Draft, produce } from "immer"
import * as S from "./types"
import * as StateTree from "./stateTree"
import { getStateTreeFromConfig } from "./getStateTreeFromConfig"

/* -------------------------------------------------- */
/*                Create State Designer               */
/* -------------------------------------------------- */

export function createStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>
>(config: S.Config<D, R, C, A, Y>): S.StateDesigner<D> {
  /* ------------------ Mutable Data ------------------ */

  const current: {
    payload: any
    result: any
  } = { payload: undefined, result: undefined }

  const update = {
    transitions: 0,
    didTransition: false,
    didAction: false,
  }

  let data: D = config.data as D

  const stateTree = getStateTreeFromConfig(config)

  let active = StateTree.getActiveStates(stateTree)

  /* ------------------ Subscriptions ----------------- */

  // A set of subscription callbacks. The subscribe function
  // adds a callback to the set; unsubscribe removes it.
  const subscribers = new Set<S.SubscriberFn<D>>([])

  // Unsubscribe -> see Public API below

  // Subscribe -> see Public API below

  // Call each subscriber callback with the state's current update
  function notifySubscribers() {
    active = StateTree.getActiveStates(stateTree)
    subscribers.forEach((subscriber) =>
      subscriber({ data: data, active, stateTree })
    )
  }

  /* --------------------- Updates -------------------- */

  // Run event handler that updates the global `updates` object,
  // useful for (more or less) synchronous events
  async function runOnThreadEventHandler(eventHandler: S.EventHandler<D>) {
    const localUpdate = await runEventHandler(eventHandler)
    if (localUpdate.didAction) update.didAction = true
    if (localUpdate.didTransition) update.didTransition = true
    return update
  }

  // Run event handler that only returns a local `updates` object,
  // useful in handling delayed events, repeats, etc; so that they don't
  // interfere with "on thread" event handling.
  async function runOffThreadEventHandler(eventHandler: S.EventHandler<D>) {
    const updates = await runEventHandler(eventHandler)
    return updates
  }

  // Try to run an event on a state. If active, it will run the corresponding
  // event, if it has one; and, so long as there hasn't been a transition,
  // will run its onEvent event, if it has one. If still no transition has
  // occurred, it will move to try its child states.
  async function handleEventOnState(
    state: S.State<D>,
    sent: S.SendItem
  ): Promise<void> {
    if (state.active) {
      const eventHandler = state.on[sent.event]

      // Run event handler, if present
      if (!isUndefined(eventHandler)) {
        runOnThreadEventHandler(eventHandler)
        if (update.didTransition) return
      }

      // Run onEvent, if present
      if (!isUndefined(state.onEvent)) {
        runOnThreadEventHandler(state.onEvent)
        if (update.didTransition) return
      }

      // Run event on states
      for (let childState of Object.values(state.states)) {
        await handleEventOnState(childState, sent)
        if (update.didTransition) return
      }
    }

    return
  }

  async function runEventHandler(
    eventHandler: S.EventHandler<D>
  ): Promise<{
    didTransition: boolean
    didAction: boolean
  }> {
    let localUpdate = {
      didAction: false,
      didTransition: false,
    }

    for (let item of eventHandler) {
      // Results

      for (let resu of item.get) {
        current.result = resu(data, current.payload, current.result)
      }

      // Conditions

      let passedConditions = true

      if (passedConditions && item.if.length > 0) {
        passedConditions = item.if.every((cond) =>
          cond(data, current.payload, current.result)
        )
      }

      if (passedConditions && item.unless.length > 0) {
        passedConditions = item.unless.every(
          (cond) => !cond(data, current.payload, current.result)
        )
      }

      if (passedConditions && item.ifAny.length > 0) {
        passedConditions = item.ifAny.some((cond) =>
          cond(data, current.payload, current.result)
        )
      }

      if (item.wait) {
        const s = item.wait(data, current.payload, current.result)
        await new Promise((resolve) => setTimeout(() => resolve(), s * 1000))
      }

      if (passedConditions) {
        // Actions
        if (item.do.length > 0) {
          localUpdate.didAction = true
          data = produce(data, (draft) => {
            for (let action of item.do) {
              action(draft as D, current.payload, current.result)
            }
          })
        }

        // Send
        if (!isUndefined(item.send)) {
          const sendItem = item.send(data, current.payload, current.result)
          send(sendItem.event, sendItem.payload)
        }

        // Transitions
        if (!isUndefined(item.to)) {
          if (update.transitions > 200) {
            throw Error("Stuck in a loop! Bailing.")
          }

          update.transitions++
          localUpdate.didTransition = true
          runTransition(item.to)
          return localUpdate
        }
      } else {
        // Else Actions
        if (item.elseDo.length > 0) {
          localUpdate.didAction = true
          data = produce(data, (draft) => {
            for (let action of item.elseDo) {
              action(draft as D, current.payload, current.result)
            }
          })
        }

        // Else Transitions
        if (!isUndefined(item.elseTo)) {
          if (update.transitions > 200) {
            throw Error("Stuck in a loop! Bailing.")
          }

          update.transitions++
          localUpdate.didTransition = true
          runTransition(item.elseTo)
          return localUpdate
        }
      }
    }

    return localUpdate
  }

  async function runTransition(targetFn: S.EventFn<D, string>) {
    let targetPath = targetFn(data)

    // Is this a restore transition?

    const isPreviousTransition = targetPath.endsWith(".previous")
    const isRestoreTransition = targetPath.endsWith(".restore")

    if (isPreviousTransition) {
      targetPath = trimEnd(targetPath, ".previous")
    }

    if (isRestoreTransition) {
      targetPath = trimEnd(targetPath, ".restore")
    }

    // Get all states from the tree that match the target
    const targets = StateTree.findTransitionTargets(stateTree, targetPath)

    // Get the deepest matching target state
    const target = last(targets)

    if (isUndefined(target)) {
      throw Error("No state with that path in the tree!")
    }

    // Get the path of state names to the target state
    const pathDown = target.path.split(".")

    // Get an array of states that are currently active
    const beforeActive = StateTree.getActiveStates(stateTree)

    // Deactivate the whole state tree
    StateTree.deactivateState(stateTree)

    // Use the path to activate the tree again
    StateTree.activateState(
      stateTree,
      pathDown,
      isPreviousTransition || isRestoreTransition,
      isRestoreTransition
    )

    // Get an array of states that are now active
    const afterActive = StateTree.getActiveStates(stateTree)

    // Get an array of states that are no longer active
    const deactivatedStates = beforeActive.filter(
      (state) => !afterActive.includes(state)
    )

    // Get an array of states that have become active
    const activatedStates = afterActive.filter(
      (state) => !beforeActive.includes(state)
    )

    const currentTransitions = update.transitions

    // Deactivated States
    // - clear any intervals
    // - handle onExit events
    // - bail if we've transitioned

    deactivatedStates.forEach(StateTree.clearIntervalsOnState)

    for (let state of deactivatedStates) {
      const { onExit } = state

      if (!isUndefined(onExit)) {
        runOnThreadEventHandler(onExit)
      }

      if (update.transitions > currentTransitions) return
    }

    // Activated States
    // - set any repeat intervals
    // - handle onEnter events
    // - bail if we've transitioned

    for (let state of activatedStates) {
      const { async, repeat, onEnter } = state

      if (!isUndefined(repeat)) {
        const s = repeat.delay(data, current.payload, current.result)

        state.intervals.push(
          setInterval(async () => {
            const localUpdate = await runOffThreadEventHandler(repeat.event)

            if (localUpdate.didAction || localUpdate.didTransition) {
              notifySubscribers()
            }
          }, Math.max(1 / 60, s * 1000))
        )
      }

      if (!isUndefined(onEnter)) {
        runOnThreadEventHandler(onEnter)
      }

      if (update.transitions > currentTransitions) return

      if (!isUndefined(async)) {
        async.await(data, current.payload, current.result).then(
          async (result) => {
            current.result = result
            const localUpdate = await runOffThreadEventHandler(async.onResolve)
            if (localUpdate.didAction || localUpdate.didTransition) {
              notifySubscribers()
            }
          },
          async (result) => {
            if (!isUndefined(async.onReject)) {
              current.result = result
              const localUpdate = await runOffThreadEventHandler(async.onReject)
              if (localUpdate.didAction || localUpdate.didTransition) {
                notifySubscribers()
              }
            }
          }
        )
      }
    }

    return
  }

  /* -------------- Sent Event Processing ------------- */

  const sendQueue: S.SendItem[] = []

  let pendingProcess: Promise<S.Update<D>> | void

  async function processSendQueue(): Promise<S.Update<D>> {
    update.didAction = false
    update.didTransition = false

    const next = sendQueue.shift()

    if (isUndefined(next)) {
      pendingProcess = undefined
      update.transitions = 0
      return { data: data, active, stateTree }
    }

    current.payload = undefined
    current.result = undefined

    // Handle the event and set the current handleEventOnState
    // promise, which will hold any additional sent events
    pendingProcess = await handleEventOnState(stateTree, next)

    // Notify subscribers, if we should
    if (update.didAction || update.didTransition) {
      notifySubscribers()
    }

    // Then process the next sent event
    return processSendQueue()
  }

  /* ----------------- Public Methods ----------------- */

  /**
   * Subscribe to this state's updates. On each update, the state will call
   * the provided callback with the state's new update. This function also
   * returns a new function that will unsubscribe the callback.
   * @param callbackFn
   */
  function subscribe(callbackFn: S.SubscriberFn<D>) {
    subscribers.add(callbackFn)
    return () => unsubscribe(callbackFn)
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

  /**
   * Send an event to the state machine
   * @param eventName The name of the event
   * @param payload A payload of any type
   */
  async function send(eventName: string, payload?: any): Promise<S.Update<D>> {
    sendQueue.push({ event: eventName, payload })
    return pendingProcess ? pendingProcess : processSendQueue()
  }

  /**
   * Return true if the state tree has any (or every) of the paths active
   * @param paths The paths to check
   * @param every (optional) Whether to return true only if every path is active
   */
  function isIn(paths: string | string[], every = false): boolean {
    const p = castArray(paths)
    return (
      active.find((state) =>
        p[every ? "every" : "some"]((path) => state.path.endsWith(path))
      ) !== undefined
    )
  }

  /**
   * Return true if the event exists and would pass its conditions
   * @param eventName The name of the event
   * @param payload A payload of any type
   */
  function can(eventName: string, payload?: any): boolean {
    current.payload = payload

    return !isUndefined(
      active.find((state) => {
        const eventHandler = state.on[eventName]

        if (!isUndefined(eventHandler)) {
          current.result = undefined

          for (let item of eventHandler) {
            for (let resu of item.get) {
              current.result = resu(data, current.payload, current.result)
            }

            if (
              (item.if.length > 0 &&
                item.if.every((cond) =>
                  cond(data, current.payload, current.result)
                )) ||
              (item.unless.length > 0 &&
                !item.unless.every(
                  (cond) => !cond(data, current.payload, current.result)
                )) ||
              (item.ifAny.length > 0 &&
                item.ifAny.some((cond) =>
                  cond(data, current.payload, current.result)
                ))
            )
              return true
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
   */
  function whenIn<T>(
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
        if (active.find((v) => v.path.endsWith("." + key))) {
          entries.push([key, v])
        }
      }
    })

    let returnValue = initial

    entries.forEach(
      (entry, i) => (returnValue = reducer(returnValue, entry, i, entries))
    )

    return returnValue
  }

  /* --------------------- Kickoff -------------------- */

  // Deactivate the tree, then activate it again to trigger events
  StateTree.deactivateState(stateTree)
  runTransition(() => "root")

  return {
    data,
    active,
    send,
    isIn,
    can,
    whenIn,
    stateTree,
    subscribe,
    unsubscribe,
  }
}
