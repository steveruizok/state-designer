import * as React from "react"
import { S } from "@state-designer/core"

const emptyArray: unknown[] = []

export function useUpdateEffect<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  state: S.DesignedState<D, R, C, A, Y, T, V>,
  callback: S.SubscriberFn<D>,
  dependencies: unknown[] = emptyArray
) {
  React.useEffect(() => {
    return state.onUpdate((update) => callback(update))
  }, [state.onUpdate, ...dependencies])
}
