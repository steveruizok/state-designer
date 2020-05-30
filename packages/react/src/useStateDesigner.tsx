import { isUndefined, pick } from "lodash"
import * as React from "react"
import { createState, S } from "@state-designer/core"

const emptyArray: unknown[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided designuration.
 * @param design A designuration object for a new state — or a state returned from createState.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided design.
 */
export function useStateDesigner<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  design: S.Design<D, R, C, A, Y, T, V> | S.DesignedState<D, R, C, A, Y, T, V>,
  dependencies: any[] = emptyArray
): S.DesignedState<D, R, C, A, Y, T, V> {
  // Store a state — either as provided or new from design,
  // and, if given a design, re-create the state when dependencies change
  const state: S.DesignedState<D, R, C, A, Y, T, V> = React.useMemo(() => {
    return isUndefined((design as S.DesignedState<D, R, C, A, Y, T, V>).send)
      ? createState(design as S.Design<D, R, C, A, Y, T, V>)
      : (design as S.DesignedState<D, R, C, A, Y, T, V>)
  }, dependencies)

  // Keep subscription updates in state
  const [current, setCurrent] = React.useState<
    S.DesignedState<D, R, C, A, Y, T, V>
  >(state)

  // Subscribe to changes — and resubscribe when dependencies change.
  // Note that the effect returns the cancel function returned by onChange.
  React.useEffect(
    () =>
      state.onUpdate((update) => {
        setCurrent((current) => ({
          ...current,
          ...pick(update, "data", "active", "stateTree", "values"),
        }))
      }),
    [state, setCurrent]
  )

  return current
}
