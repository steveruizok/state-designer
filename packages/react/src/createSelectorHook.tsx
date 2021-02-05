import { useReducer, useEffect } from "react"
import { S } from "@state-designer/core"

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
export default function createSelectorHook<
  State extends S.DesignedState<any, any>
>(state: State) {
  function useSelector<T>(
    selectFn: (update: State) => T,
    compareFn: (prev: T, next: T) => boolean = (prev, next) => prev === next
  ) {
    const [current, dispatch] = useReducer(
      (state: T, update: State): T => {
        const next = selectFn(update)
        return compareFn(state, next) ? state : next
      },
      state,
      (state) => selectFn(state)
    )

    useEffect(() => state.onUpdate((update: State) => dispatch(update)), [
      dispatch,
    ])

    return current
  }

  return useSelector
}
