// @refresh-reset
import { pick } from "lodash"
import * as React from "react"
import { createState, S } from "@state-designer/core"

const emptyArray: unknown[] = []

/**
 * Create and subscribe to a new state.
 * @param design A designuration object for a new state.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided design.
 */

export default function useLocalState<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(design: S.Design<D, R, C, A, Y, T, V>, dependencies: any[] = emptyArray) {
  const rFirstMount = React.useRef(true)

  const [current, setCurrent] = React.useState(() => createState(design))

  React.useEffect(() => {
    function handleUpdate(update: S.DesignedState<any, any>) {
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
  }, dependencies)

  return current
}
