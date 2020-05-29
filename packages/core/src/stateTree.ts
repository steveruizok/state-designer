import { isUndefined } from "lodash"
import * as S from "./types"

/*
  Note: The functions in this file do not rely on closures.
*/

/**
 * Deactivate a state and its children.
 * Works recursively, so you should only call this on the state tree's root
 *
 * @param state
 */
export function deactivateState<D = any>(state: S.State<D>) {
  state.active = false
  state.activeId++
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
export function getActiveStates<D = any>(state: S.State<D>) {
  const acc: S.State<D>[] = []

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
 * the state tree.
 *
 * @param state The current state to activate.
 * @param path An array of state names.
 * @param previous Whether this is a previous-type history transition. Will only restore the history
 *                 state of the target (the deepest state in the path).
 * @param restore Whether this is a restore-type history transition. Will restore the history state
 *                of the target (the deepest state in the path) and all of its descendants.
 */
export function activateState<D = any>(
  state: S.State<D>,
  path: string[],
  beforeActive: S.State<D>[],
  previous: boolean,
  restore: boolean
): void {
  // Activate this state
  state.active = true
  state.activeId++

  // If this state is next in the path, remove it from path
  if (state.name === path[0]) {
    path.shift()
  }

  // Only actually restore previous on target state and its descendents
  const activatePrevious = previous && path.length === 0

  // If state is parallel, activate all child states.
  // Don't worry about history.
  if (isUndefined(state.initial)) {
    for (let childState of Object.values(state.states)) {
      activateState(childState, path, beforeActive, restore, restore)
    }
    return
  }

  // Branch states will activate either state in path or else,
  // if at the end of the path (or in a branch outside of it),
  // either its initial state or previous state (when restoring).
  const childStates = Object.values(state.states)

  // If the state is in path, then use the path for the next active
  // state; otherwise, use the state's initial value.
  const inPath = childStates.find((state) => state.name === path[0])

  // If restore and previous state remaining, pop that state and
  // activate the child with that name
  if (activatePrevious) {
    if (state.history.length > 1) {
      // Activating previous and remaining history — pop and activate previous
      const prev = state.history.pop()

      for (let childState of Object.values(state.states)) {
        if (childState.name === prev) {
          activateState(childState, path, beforeActive, restore, restore)
        }
      }
    } else {
      // Activating previous but no history left — activate previous
      for (let childState of childStates) {
        if (childState.name === state.history[0]) {
          activateState(childState, path, beforeActive, restore, restore)
        }
      }
    }
  } else if (inPath) {
    // Not activating previous, in path — activate next in path
    for (let childState of childStates) {
      if (childState.name === path[0]) {
        state.history.push(childState.name)
        activateState(childState, path, beforeActive, previous, restore)
      }
    }
  } else {
    // Not activating previous, not in path
    if (beforeActive.includes(state)) {
      // but previously active... so restore this branch
      for (let childState of Object.values(state.states)) {
        if (childState.name === state.history[state.history.length - 1]) {
          activateState(childState, path, beforeActive, previous, restore)
        }
      }
    } else {
      // Not activating previous, not in path — activate initial
      for (let childState of Object.values(state.states)) {
        if (childState.name === state.initial) {
          state.history.push(childState.name)
          activateState(childState, path, beforeActive, false, false)
        }
      }
    }
  }

  return
}

/**
 * Find all valid targets that match the provided path. Recursively searches the
 * state and its descendants, so you should only call this on the state tree's root.
 *
 * @param state
 * @param path
 */
export function findTransitionTargets<D = any>(
  state: S.State<D>,
  path: string
): S.State<D>[] {
  const acc: S.State<D>[] = []

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

    let passedConditions = true

    if (passedConditions && initial.if.length > 0) {
      passedConditions = initial.if.every((cond) => cond(data, payload, result))
    }

    if (passedConditions && initial.unless.length > 0) {
      passedConditions = initial.unless.every(
        (cond) => !cond(data, payload, result)
      )
    }

    if (passedConditions && initial.ifAny.length > 0) {
      passedConditions = initial.ifAny.some((cond) =>
        cond(data, payload, result)
      )
    }

    if (passedConditions) {
      return initial.to(data, payload, result)
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
export function setIntitialStates<D>(state: S.State<D>, payload: any, data: D) {
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
