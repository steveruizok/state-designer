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
// export function useStateDesigner<D, V>(
//   design: S.DesignedState<D, V>
// ): S.DesignedState<D, V>
// export function useStateDesigner<
//   D,
//   R extends Record<string, S.Result<D>>,
//   C extends Record<string, S.Condition<D>>,
//   A extends Record<string, S.Action<D>>,
//   Y extends Record<string, S.Async<D>>,
//   T extends Record<string, S.Time<D>>,
//   V extends Record<string, S.Value<D>>
// >(
//   design: S.Design<D, R, C, A, Y, T, V>,
//   dependencies: any[]
// ): S.DesignedState<
//   D,
//   {
//     [key in keyof V]: ReturnType<V[key]>
//   }
// >
export function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>,
  P,
  J extends unknown extends P
    ? {
        [key in keyof V]: ReturnType<V[key]>
      }
    : P
>(
  design: S.Design<D, R, C, A, Y, T, V> | S.DesignedState<D, P>,
  dependencies: any[] = emptyArray
): S.DesignedState<D, J> {
  const designAsDesignedState = design as S.DesignedState<D, J>
  const designAsDesign = design as S.Design<D, R, C, A, Y, T, V>

  // Store a state — either as provided or new from design,
  // and, if given a design, re-create the state when dependencies change
  // @ts-ignore -- This sucks!
  const state: S.DesignedState<D, J> = React.useMemo(() => {
    return isUndefined(designAsDesignedState.send)
      ? createState(designAsDesign)
      : designAsDesignedState
  }, [...dependencies])

  // Keep subscription updates in state
  const [current, setCurrent] = React.useState(state)

  // Subscribe to changes — and resubscribe when dependencies change.
  // Note that the effect returns the cancel function returned by onChange.
  React.useEffect(() => {
    setCurrent(state)

    function handleUpdate(update: S.DesignedState<D, J>) {
      setCurrent((current) => ({
        ...current,
        ...pick(update, "data", "active", "stateTree", "values", "log"),
      }))
    }

    // Set state now...
    // state.getUpdate(handleUpdate)

    // And subsribe to updates (will return function that unsubscribes)
    return state.onUpdate(handleUpdate)
  }, [state, setCurrent])

  return current
}
