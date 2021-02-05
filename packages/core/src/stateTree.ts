import last from "lodash-es/last"
import forEach from "lodash-es/forEach"
import isUndefined from "lodash-es/isUndefined"

import { testEventHandlerConditions } from "./testEventHandlerConditions"
import * as S from "./types"

/**
 * Deactivate a state and its children.
 * Works recursively, so you should only call this on the state tree's root
 *
 * @param state
 */
export function deactivateState<G extends S.DesignedState>(state: S.State<G>) {
  state.active = false
  for (let childState of Object.values(state.states)) {
    deactivateState(childState)
  }
}

/**
 * Get an array of all active states in the current tree.
 * Works recursively, so you should only call this on the state tree's root.
 *
 * @param state The current state to examine.
 */
export function getActiveStates<G extends S.DesignedState>(state: S.State<G>) {
  const acc: S.State<G>[] = []

  if (state.active) {
    acc.push(state)
    for (let childState of Object.values(state.states)) {
      acc.push(...getActiveStates(childState))
    }
  }

  return acc
}

/**
 * Activate a state based on a path. This function will recursively activate all states in the path,
 * as well as children of those states as necessary. You should only call this on the root of
 * the state tree. See notes on ACTIVATING STATES.
 *
 * @param state The current state to activate.
 * @param path An array of state names.
 * @param before An array of states that were previously active.
 * @param prev Whether we should try to restore this state.
 * @param deep Whether we should also try to restore descendant states.
 */
export function activateState<G extends S.DesignedState>(
  state: S.State<G>,
  path: string[],
  before: S.State<G>[],
  prev: boolean,
  deep: boolean
) {
  let isTarget = false
  state.active = true

  if (state.name === path[0]) {
    path.shift()
    if (path.length === 0) {
      isTarget = true
    }
  }

  if (state.initial === undefined) {
    // Skipping Parallel
    forEach(state.states, (c) => activateState(c, path, before, prev, deep))
  } else if (prev && path.length === 0) {
    // Restoring target (down-tree from target)
    const c = state.states[last(state.history) || state.initial]
    activateState(c, path, before, deep, deep)
  } else if (state.states[path[0]] !== undefined) {
    // Activating Next in Path
    const c = state.states[path[0]]
    state.history.push(c.name)
    activateState(c, path, before, prev, deep)
  } else if (!isTarget && before.includes(state)) {
    // Restoring Unrelated (not target, not in path branch)
    const c = state.states[last(state.history) || state.initial]
    activateState(c, path, before, false, false)
  } else {
    // Activating Initial
    const c = state.states[state.initial]
    state.history.push(c.name)
    activateState(c, path, before, false, false)
  }
}

/**
 * Find all valid targets that match the provided path. Recursively searches the
 * state and its descendants, so you should only call this on the state tree's root.
 *
 * @param state
 * @param path
 */
export function findTransitionTargets<G extends S.DesignedState>(
  state: S.State<G>,
  path: string
): S.State<G>[] {
  const acc: S.State<G>[] = []

  let safePath = path.startsWith(".") ? path : "." + path

  if (state.path.endsWith(safePath)) {
    acc.push(state)
  }

  for (let childState of Object.values(state.states)) {
    acc.push(...findTransitionTargets(childState, path))
  }

  return acc
}

/**
 * Compute a state's initial state, given the state's initialFn and the provided payload and data.
 *
 * @param initial
 * @param payload
 * @param data
 */
export function getInitialState<D>(
  initial: S.InitialStateObject<D>,
  payload: any,
  data: D
): string {
  if (initial.else !== undefined) {
    // Initial State with Logic
    let result: any = undefined

    for (let resu of initial.get) {
      result = resu(data, payload, result)
    }

    if (testEventHandlerConditions(initial, data, payload, result)) {
      // TODO: The initial state object design should not allow both a `then` and `else` property.
      if (initial.then !== undefined) {
        return getInitialState(initial.then, payload, data)
      } else {
        return initial.to(data, payload, result)
      }
    } else {
      return getInitialState(initial.else, payload, data)
    }
  } else {
    return initial.to(data, payload, undefined)
  }
}

/**
 * Recursively set initial states. Call this function on the state tree before transitioning.
 *
 * @param state
 * @param payload
 * @param data
 */
export function setIntitialStates<G extends S.DesignedState>(
  state: S.State<G>,
  payload: any,
  data: G["data"]
) {
  if (state.initialFn !== undefined) {
    state.initial = getInitialState(state.initialFn, payload, data)
  }

  if (state.states !== undefined) {
    // Parallel State
    for (let child of Object.values(state.states)) {
      setIntitialStates(child, payload, data)
    }
  }
}

export function endStateIntervals<G extends S.DesignedState>(
  state: S.State<G>
) {
  const { cancelAsync, timeouts, interval, animationFrame } = state.times

  // If state is waiting on an asynchronous event, cancel it
  if (cancelAsync !== undefined) {
    cancelAsync()
    state.times.cancelAsync = undefined
  }

  // If state is waiting on timeouts, clear them
  for (let timeout of timeouts) {
    clearTimeout(timeout)
  }

  state.times.timeouts = []

  // If state is repeating an event on an interval, stop it
  if (!isUndefined(interval)) {
    clearInterval(interval)
    state.times.interval = undefined
  }

  // If the state is repeating an event on an animation frame, stop it
  if (!isUndefined(animationFrame)) {
    cancelAnimationFrame(animationFrame)
    state.times.animationFrame = undefined
  }
}

export function recursivelyEndStateIntervals<G extends S.DesignedState>(
  state: S.State<G>
) {
  endStateIntervals(state)
  for (let child of Object.values(state.states)) {
    recursivelyEndStateIntervals(child)
  }
}

/* 
  ACTIVATING STATES

  Activating states can be complex. We definitely want to make
  this state active. If this state is next in the path, we 
  want to remove it from the path.

  Next we check if it's a parallel state. Parallel states are easy. 
  If state is parallel, we activate all of its child states and 
  pass on the prev / restore arguments. Don't change their 
  histories—parallel states don't need them. 

  If it's a branch state, then we'll either need to activate its
  initial child state, "restore" it by activating its prevly 
  active state, or activate the next state in the path.

  There are two types of transitions that might cause us to restore
  a state: 'prev' and 'restore'. A prev transition only 
  restores the target state; a restore transition also restores the
  target state's descendants.

  What if we're not restoring this state?

  If this state's children include the next state is in the path,
  activate the state and pass on the transition's prev and
  restore values. (We might still have a prev/restore transition 
  further down the path.)
  
  Otherwise, then what we do next depends on whether it was active 
  before the current transition. If it was active, then we'll want 
  to restore it back to how it was. If it was not active, then we'll
  activate it "normally", according to its initial value, and pushing
  to its history. */
