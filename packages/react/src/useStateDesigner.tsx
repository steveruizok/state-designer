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
  design:
    | S.Design<D, R, C, A, Y, T, V>
    | S.DesignedState<
        D,
        {
          [key in keyof V]: ReturnType<V[key]>
        }
      >,
  dependencies: any[] = emptyArray
): S.DesignedState<D, { [key in keyof V]: ReturnType<V[key]> }> {
  type RV = S.DesignedState<D, { [key in keyof V]: ReturnType<V[key]> }>

  // Store a state — either as provided or new from design,
  // and, if given a design, re-create the state when dependencies change
  const state: RV = React.useMemo(() => {
    return isUndefined((design as RV).send)
      ? createState(design as RV)
      : (design as RV)
  }, dependencies)

  // Keep subscription updates in state
  const [current, setCurrent] = React.useState<RV>(state)

  // Subscribe to changes — and resubscribe when dependencies change.
  // Note that the effect returns the cancel function returned by onChange.
  React.useEffect(() => {
    function handleUpdate(update: RV) {
      setCurrent((current) => ({
        ...current,
        ...pick(update, "data", "active", "stateTree", "values"),
      }))
    }

    // Set state now...
    state.getUpdate(handleUpdate)

    // And subsribe to updates (will return function that unsubscribes)
    return state.onUpdate(handleUpdate)
  }, [state, setCurrent])

  return current
}
