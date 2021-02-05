import { S, createState } from "@state-designer/core"
import * as React from "react"
import pick from "lodash-es/pick"
import useGlobalState from "./useGlobalState"
import useLocalState from "./useLocalState"

const emptyArray: unknown[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided designuration.
 * @param design A designuration object for a new state — or a state returned from createState.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided design.
 */

export function useStateDesigner<D, V extends Record<string, S.Value<D>>>(
  design: S.DesignedState<D, V>
): ReturnType<typeof useGlobalState>

export function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(design: S.Design<D, R, C, A, Y, T, V>): ReturnType<typeof useLocalState>

export default function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  design: S.Design<D, R, C, A, Y, T, V> | S.DesignedState<D, V>,
  dependencies: any[] = emptyArray
) {
  const rFirstMount = React.useRef(true)

  const [current, setCurrent] = React.useState<S.DesignedState<D, V>>(() =>
    "active" in design ? design : createState(design)
  )

  // Global
  React.useEffect(() => {
    if (!("active" in design)) return

    setCurrent(design)

    return design.onUpdate((update) =>
      setCurrent((current) => ({
        ...current,
        ...pick(
          update,
          "index",
          "data",
          "active",
          "stateTree",
          "values",
          "log"
        ),
      }))
    )
  }, [design])

  // Local
  React.useEffect(() => {
    if ("active" in design) return

    function handleUpdate(update: typeof current) {
      setCurrent((current) => ({
        ...current,
        ...pick(
          update,
          "index",
          "data",
          "active",
          "stateTree",
          "values",
          "log"
        ),
      }))
    }

    // Only create a new state if the `design` property is design object.
    if (!rFirstMount.current) {
      const next = createState(design)
      setCurrent(next)
      return next.onUpdate(handleUpdate)
    }

    rFirstMount.current = false
    return current.onUpdate(handleUpdate)
  }, [...dependencies])

  return current
}
