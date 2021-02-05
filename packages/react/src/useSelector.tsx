import { useReducer, useEffect } from "react"
import { S } from "@state-designer/core"

/**
 * useSelector
 * @param state A state created with `createState`.
 * @param selectFn A function that returns information derived from a state update.
 * @param compareFn - (Optional) A function to test whether the new selection matches the old section.
 * @example const tables = useSelector(state, (update) => update.data.tables)
 */
export default function useSelector<State extends S.DesignedState, T>(
  state: State,
  selectFn: (update: State) => T,
  compareFn: (prev: T, next: T) => boolean = (prev, next) => prev === next
): T {
  const [current, dispatch] = useReducer(
    (state: T, update: State): T => {
      const next = selectFn(update)
      return compareFn(state, next) ? state : next
    },
    state,
    (state) => selectFn(state)
  )

  useEffect(() => state.onUpdate((update: State) => dispatch(update)), [
    state,
    dispatch,
  ])

  return current
}
