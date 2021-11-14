/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useEffect } from 'react'
import type { S } from '@state-designer/core'

type InnerState<T> = { count: number; current: T }

/**
 * createSelectorHook
 * @description A function that returns a useSelector hook for the
 * given state. The hook works just like `useSelector`, except that
 * you do not need to pass the hook a state as its first argument.
 * @param state A state created with `createState`.
 * @example const useSelector = createSelectorHook(roomState)
 *
 * // In a component
 * const tables = useSelector((state) => state.data.tables)
 */

export default function createSelectorHook<State extends S.DesignedState<any, any>>(state: State) {
  return function useSelector<T>(
    selectFn: (update: State) => T,
    compareFn: (prev: T, next: T) => boolean = (prev, next) => prev === next
  ) {
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

    useEffect(() => state.onUpdate((update) => dispatch(update)), [dispatch])

    return inner.current
  }
}
