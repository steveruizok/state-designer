// @refresh-reset
import pick from "lodash/pick"
import * as React from "react"
import { S } from "@state-designer/core"

/**
 * Subscribe a component to a state created with createState.
 * @param design A state returned from createState.
 */

export default function useGlobalState<D, V extends Record<string, S.Value<D>>>(
  design: S.DesignedState<D, V>
) {
  const [current, setCurrent] = React.useState(() => design)

  React.useEffect(() => {
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

  return current
}
