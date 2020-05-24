import { isUndefined, pick } from "lodash"
import * as React from "react"
import { createStateDesign, S } from "@state-designer/core"

const emptyArray: any[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided configuration.
 * @param config A configuration object for a new state — or a state returned from createStateDesign.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided config.
 */
export function useStateDesign<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  config: S.Config<D, R, C, A, Y, T, V> | S.StateDesign<D, R, C, A, Y, T, V>,
  dependencies: any[] = emptyArray
): S.StateDesign<D, R, C, A, Y, T, V> {
  // Store a state — either as provided or new from config,
  // and, if given a config, re-create the state when dependencies change
  const state: S.StateDesign<D, R, C, A, Y, T, V> = React.useMemo(() => {
    return isUndefined((config as S.StateDesign<D, R, C, A, Y, T, V>).send)
      ? createStateDesign(config)
      : (config as S.StateDesign<D, R, C, A, Y, T, V>)
  }, dependencies)

  // Keep subscription updates in state
  const [current, setCurrent] = React.useState<
    S.StateDesign<D, R, C, A, Y, T, V>
  >(state)

  // Subscribe to changes — and resubscribe when dependencies change.
  // Note that the effect returns the cancel function returned by onChange.
  React.useEffect(
    () =>
      state.onUpdate((update) => {
        setCurrent({ ...update })
      }),
    [state, setCurrent]
  )

  return { ...state, ...pick(current, "data", "active", "stateTree", "values") }
}
