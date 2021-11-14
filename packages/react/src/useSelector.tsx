import { useReducer, useEffect } from 'react'
import type { S } from '@state-designer/core'

type InnerState<T> = { count: number; current: T }

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
  const [inner, dispatch] = useReducer(
    (state: InnerState<T>, update: State): InnerState<T> => {
      const next = selectFn(update)
      return compareFn(state.current, next)
        ? state
        : {
            count: state.count + 1,
            current: next,
          }
    },
    state,
    (state) => ({
      count: 0,
      current: selectFn(state),
    })
  )

  useEffect(() => state.onUpdate((update: State) => dispatch(update)), [state, dispatch])

  return inner.current
}
