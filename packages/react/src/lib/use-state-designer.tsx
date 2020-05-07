import pick from "lodash-es/pick"
import isUndefined from "lodash-es/isUndefined"
import * as React from "react"
import { createStateDesigner, S } from "@state-designer/core"

const emptyArray: any[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided configuration.
 * @param config A configuration object for a new state — or a state returned from createStateDesigner.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided config.
 */
export function useStateDesigner<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>
>(
  config: S.Config<D, R, C, A> | S.StateDesigner<D>,
  dependencies = emptyArray
): S.Update<D> & Pick<S.StateDesigner<D>, "send" | "isIn" | "can" | "whenIn"> {
  // Store a state — either as provided or new from config
  const state: S.StateDesigner<D> = React.useMemo(() => {
    return isUndefined((config as S.StateDesigner<D>).send)
      ? createStateDesigner(config)
      : (config as S.StateDesigner<D>)
  }, dependencies)

  // Keep subscription updates in state
  const [update, setUpdate] = React.useState<S.Update<D>>({
    data: state.data,
    stateTree: state.stateTree,
  })

  // Subscribe — and resubscribe when dependencies change
  React.useEffect(() => state.subscribe(setUpdate), [state, setUpdate])

  return {
    ...update,
    ...pick(state, ["send", "isIn", "can", "whenIn"]),
  }
}
